import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h, watch } from 'vue'

import { useSessionStore } from '@/core/auth/stores/session.store'
import { httpClient } from '@/core/http/axios-client'
import { PRICING_TIERS_QUERY_KEY } from '@/shared/pricing/use-pricing-tiers'
import { useCartActions, type ICartPhotoInput } from './use-cart-actions'
import { useCartState } from './use-cart-state'

// These go through the real http client and its interceptors: the session expiring is about how
// the cart and the token refresh work together, which a mocked client would hide.

const { message } = vi.hoisted(() => ({
  message: { success: vi.fn(), info: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))
vi.mock('@/core/ui/discrete-api', () => ({ message }))
// The interceptor sends to the login page from private screens; the cart is used on public ones.
vi.mock('@/app/router', () => ({
  default: {
    currentRoute: {
      value: { matched: [{ meta: {} }], meta: { public: true }, fullPath: '/gallery' },
    },
    resolve: vi.fn(),
    push: vi.fn(),
  },
}))

type Handler = (config: InternalAxiosRequestConfig) => Promise<{ status: number; body: unknown }>

const requests: { method: string; url: string; auth: string | undefined }[] = []
let handle: Handler = async () => ({ status: 200, body: { data: [], meta: {} } })

const adapter: AxiosAdapter = async (config) => {
  const auth = (config.headers?.Authorization as string | undefined) ?? undefined
  requests.push({ method: (config.method ?? 'get').toUpperCase(), url: config.url ?? '', auth })
  const { status, body } = await handle(config)
  const response = { data: body, status, statusText: '', headers: {}, config } as AxiosResponse
  if (status >= 400) {
    throw new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, {}, response)
  }
  return response
}
;(
  httpClient as unknown as { axios: { defaults: { adapter: AxiosAdapter } } }
).axios.defaults.adapter = adapter

const EVENT = {
  id: 'e1',
  name: 'Mama Rumi 2026',
  slug: 'mama-rumi',
  startDate: new Date(2026, 9, 4),
  endDate: new Date(2026, 9, 4),
}
const photo = (id: string): ICartPhotoInput => ({ id, publicSlug: `slug-${id}`, event: EVENT })

const cartBody = (ids: string[]) => ({
  data: ids.length
    ? [
        {
          eventId: 'e1',
          eventName: EVENT.name,
          eventSlug: EVENT.slug,
          startDate: '2026-10-04',
          endDate: '2026-10-04',
          photos: ids.map((id) => ({ id, publicSlug: `slug-${id}` })),
        },
      ]
    : [],
  meta: {},
})
/** What the fake server keeps in the cart: adds and removes that got through change it. */
const kept = new Set<string>()
function keep(config: InternalAxiosRequestConfig) {
  if (isRequest(config, 'POST', '/cart/items')) {
    kept.add((JSON.parse(config.data as string) as { photoId: string }).photoId)
  }
  return { status: 200, body: { data: {}, meta: {} } }
}
const keptCart = () => ({ status: 200, body: cartBody([...kept]) })

const unauthorized = { status: 401, body: { error: { code: 'UNAUTHORIZED', message: 'x' } } }
const ok = { status: 200, body: { data: {}, meta: {} } }

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  queryClient.setQueryData(PRICING_TIERS_QUERY_KEY, undefined)
  let state!: ReturnType<typeof useCartState>
  let actions!: ReturnType<typeof useCartActions>
  const seen: string[] = []
  const Host = defineComponent({
    setup() {
      state = useCartState()
      actions = useCartActions()
      watch(
        [state.status, () => state.groups.value.length],
        ([status, count]) => seen.push(`${status}:${count}`),
        { immediate: true, flush: 'sync' },
      )
      return () => h('div')
    },
  })
  mount(Host, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } })
  return { state: () => state, actions: () => actions, seen }
}

const signedIn = () => useSessionStore().setAccessToken('old-token')
const isRequest = (config: InternalAxiosRequestConfig, method: string, url: string) =>
  (config.method ?? 'get').toUpperCase() === method && config.url === url

describe('the cart when the session has expired', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    requests.length = 0
    kept.clear()
    Object.values(message).forEach((mock) => mock.mockReset())
  })

  describe('reading the cart', () => {
    it('drops the session and reads the anonymous cart, never calling the account cart empty', async () => {
      signedIn()
      handle = async (config) => {
        if (isRequest(config, 'POST', '/auth/refresh')) return unauthorized
        if (isRequest(config, 'GET', '/cart')) {
          return config.headers?.Authorization
            ? unauthorized
            : { status: 200, body: cartBody(['anon-1']) }
        }
        return ok
      }

      const { state, seen } = setup()
      await vi.waitFor(() => expect(state().status.value).toBe('success'))
      await flushPromises()

      expect(useSessionStore().isAuthenticated).toBe(false)
      expect(state().groups.value[0]?.photos.map((each) => each.id)).toEqual(['anon-1'])
      const carts = requests.filter((request) => request.url === '/cart')
      expect(carts[0]!.auth).toBe('Bearer old-token')
      expect(carts[carts.length - 1]!.auth).toBeUndefined()
      // Before the anonymous cart arrived the cart was never "read and empty".
      const firstSuccess = seen.findIndex((entry) => entry.startsWith('success'))
      expect(seen[firstSuccess]).toBe('success:1')
      expect(seen).not.toContain('success:0')
    })

    it('keeps the account cart when the refresh works', async () => {
      signedIn()
      handle = async (config) => {
        if (isRequest(config, 'POST', '/auth/refresh')) {
          return { status: 200, body: { data: { accessToken: 'new-token' }, meta: {} } }
        }
        if (isRequest(config, 'GET', '/cart')) {
          return config.headers?.Authorization === 'Bearer new-token'
            ? { status: 200, body: cartBody(['mine']) }
            : unauthorized
        }
        return ok
      }

      const { state } = setup()
      await vi.waitFor(() => expect(state().status.value).toBe('success'))

      expect(useSessionStore().accessToken).toBe('new-token')
      expect(state().groups.value[0]?.photos.map((each) => each.id)).toEqual(['mine'])
    })
  })

  describe('changing the cart', () => {
    async function readyWithCart(refreshWorks: boolean) {
      signedIn()
      let token = 'old-token'
      let refreshes = 0
      handle = async (config) => {
        const auth = config.headers?.Authorization
        if (isRequest(config, 'POST', '/auth/refresh')) {
          refreshes++
          if (!refreshWorks) return unauthorized
          token = 'new-token'
          return { status: 200, body: { data: { accessToken: token }, meta: {} } }
        }
        if (isRequest(config, 'GET', '/cart')) return keptCart()
        // The token expires right after the cart was read.
        if (refreshes === 0 && auth === 'Bearer old-token') return unauthorized
        if (auth && auth !== `Bearer ${token}`) return unauthorized
        return keep(config)
      }
      const harness = setup()
      await vi.waitFor(() => expect(harness.state().status.value).toBe('success'))
      requests.length = 0
      return harness
    }

    it('retries the add once with the new token and keeps it', async () => {
      const { state, actions } = await readyWithCart(true)

      actions().toggle(photo('p1'))
      await vi.waitFor(() => expect(message.success).toHaveBeenCalled())

      const adds = requests.filter((request) => request.url === '/cart/items')
      expect(adds.map((request) => request.auth)).toEqual(['Bearer old-token', 'Bearer new-token'])
      expect(state().isInCart('p1')).toBe(true)
      expect(message.error).not.toHaveBeenCalled()
    })

    it('does not count the add, and says the session expired, when the refresh fails', async () => {
      const { state, actions } = await readyWithCart(false)

      actions().toggle(photo('p1'))
      await vi.waitFor(() =>
        expect(message.warning).toHaveBeenCalledWith(
          'Tu sesión se cerró. Inicia sesión de nuevo para continuar.',
        ),
      )
      await flushPromises()

      expect(message.error).not.toHaveBeenCalled()
      expect(message.success).not.toHaveBeenCalled()
      expect(state().isInCart('p1')).toBe(false)
      expect(useSessionStore().isAuthenticated).toBe(false)
      expect(useSessionStore().expired).toBe(true)
    })

    it('does not let the retry jump ahead of the changes queued behind it', async () => {
      signedIn()
      let releaseRefresh: () => void = () => {}
      const refreshGate = new Promise<void>((resolve) => (releaseRefresh = resolve))
      let token = 'old-token'
      handle = async (config) => {
        if (isRequest(config, 'POST', '/auth/refresh')) {
          await refreshGate
          token = 'new-token'
          return { status: 200, body: { data: { accessToken: token }, meta: {} } }
        }
        if (isRequest(config, 'GET', '/cart')) return keptCart()
        return config.headers?.Authorization === `Bearer ${token}` ? keep(config) : unauthorized
      }
      const { state, actions } = setup()
      await vi.waitFor(() => expect(state().status.value).toBe('success'))
      token = 'rotated'
      requests.length = 0

      actions().toggle(photo('p1'))
      actions().toggle(photo('p2'))
      await flushPromises()
      expect(requests.map((request) => `${request.method} ${request.url}`)).toEqual([
        'POST /cart/items',
        'POST /auth/refresh',
      ])

      releaseRefresh()
      await vi.waitFor(() => expect(message.success).toHaveBeenCalledTimes(2))

      const order = requests
        .filter((request) => request.url !== '/cart')
        .map((request) =>
          request.url === '/auth/refresh'
            ? `${request.method} ${request.url}`
            : `${request.method} ${request.url} ${request.auth ?? ''}`.trim(),
        )
      expect(order).toEqual([
        'POST /cart/items Bearer old-token',
        'POST /auth/refresh',
        'POST /cart/items Bearer new-token',
        'POST /cart/items Bearer new-token',
      ])
      expect(state().isInCart('p1')).toBe(true)
      expect(state().isInCart('p2')).toBe(true)
    })
  })
})
