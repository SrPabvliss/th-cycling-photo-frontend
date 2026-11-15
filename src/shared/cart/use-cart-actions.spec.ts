import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { AxiosError, type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h, isVNode, type VNode } from 'vue'

import { useSessionStore } from '@/core/auth/stores/session.store'
import { SessionExpiredError } from '@/core/http/session-expired'
import { PRICING_TIERS_QUERY_KEY } from '@/shared/pricing/use-pricing-tiers'
import { useCartStore } from '@/shared/stores/cart.store'
import { useCartActions, type ICartPhotoInput } from './use-cart-actions'
import { useCartState } from './use-cart-state'

// Hoisted with the mocks below, which the module under test imports as it loads.
const { http, message } = vi.hoisted(() => ({
  http: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
  message: { success: vi.fn(), info: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))

vi.mock('@/core/http/axios-client', () => ({
  httpClient: {
    get: (...args: unknown[]) => http.get(...args),
    post: (...args: unknown[]) => http.post(...args),
    delete: (...args: unknown[]) => http.delete(...args),
  },
}))
vi.mock('@/core/ui/discrete-api', () => ({ message }))

const EVENT = {
  id: 'e1',
  name: 'Mama Rumi 2026',
  slug: 'mama-rumi',
  startDate: '2026-10-04',
  endDate: '2026-10-04',
}

const TIERS = {
  currency: 'USD',
  source: 'default' as const,
  tiers: [
    { minQty: 1, maxQty: 2, pricePerPhoto: 4 },
    { minQty: 3, maxQty: 6, pricePerPhoto: 3 },
    { minQty: 7, maxQty: 9, pricePerPhoto: 2.5 },
    { minQty: 10, maxQty: null, pricePerPhoto: 2 },
  ],
}

const photo = (id: string): ICartPhotoInput => ({
  id,
  publicSlug: `slug-${id}`,
  event: {
    id: EVENT.id,
    name: EVENT.name,
    slug: EVENT.slug,
    startDate: new Date(2026, 9, 4),
    endDate: new Date(2026, 9, 4),
  },
})

/** The cart as the server sends it, with these photos of the one event. */
function serverCart(ids: string[]) {
  return {
    data: ids.length
      ? [
          {
            eventId: EVENT.id,
            eventName: EVENT.name,
            eventSlug: EVENT.slug,
            startDate: EVENT.startDate,
            endDate: EVENT.endDate,
            photos: ids.map((id) => ({ id, publicSlug: `slug-${id}` })),
          },
        ]
      : [],
    meta: {},
  }
}

function deferred<T = unknown>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function httpError(status: number, code?: string): AxiosError {
  const response = { status, data: { error: { code, message: 'x' } }, headers: {}, config: {} }
  return new AxiosError('failed', 'ERR', undefined, undefined, response as AxiosResponse)
}

async function setup(options: { inCart?: string[]; tiers?: boolean } = {}) {
  http.get.mockResolvedValue(serverCart(options.inCart ?? []))
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  if (options.tiers !== false) queryClient.setQueryData(PRICING_TIERS_QUERY_KEY, TIERS)

  let state!: ReturnType<typeof useCartState>
  let actions!: ReturnType<typeof useCartActions>
  const Host = defineComponent({
    setup() {
      state = useCartState()
      actions = useCartActions()
      return () => h('div')
    },
  })
  mount(Host, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } })
  await flushPromises()
  http.get.mockClear()

  return { state, actions, queryClient }
}

/** Text of a toast, whether it was given as a string or as a render function. */
function textOf(content: unknown): string {
  const read = (node: unknown): string => {
    if (typeof node === 'string') return node
    if (Array.isArray(node)) return node.map(read).join('')
    if (isVNode(node)) return read((node as VNode).children)
    return ''
  }
  return read(typeof content === 'function' ? (content as () => unknown)() : content)
}
const toasts = (kind: keyof typeof message) =>
  message[kind].mock.calls.map(([content]) => textOf(content))

describe('useCartActions', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    Object.values(http).forEach((mock) => mock.mockReset())
    Object.values(message).forEach((mock) => mock.mockReset())
    http.post.mockResolvedValue({ data: {}, meta: {} })
    http.delete.mockResolvedValue({ data: {}, meta: {} })
  })

  describe('adding', () => {
    it('shows the photo in the cart before the server answers', async () => {
      const { state, actions } = await setup()
      const request = deferred()
      http.post.mockReturnValue(request.promise)

      actions.toggle(photo('p1'))

      expect(state.isInCart('p1')).toBe(true)
      expect(state.countFor('e1')).toBe(1)
      expect(state.totalCount.value).toBe(1)
      expect(useCartStore().isInCart('p1')).toBe(true)
      expect(actions.isBusy('p1')).toBe(true)

      request.resolve({ data: {}, meta: {} })
      await flushPromises()
      expect(actions.isBusy('p1')).toBe(false)
    })

    it('sends the photo with the anonymous session, quietly', async () => {
      const { actions } = await setup()

      actions.toggle(photo('p1'))
      await flushPromises()

      expect(http.post).toHaveBeenCalledWith(
        '/cart/items',
        { photoId: 'p1', sessionId: useCartStore().sessionId },
        { silent: true },
      )
    })

    it('takes the photo back out and says so when the server fails', async () => {
      const { state, actions } = await setup({ inCart: ['p0'] })
      http.post.mockRejectedValue(httpError(500))

      actions.toggle(photo('p1'))
      expect(state.countFor('e1')).toBe(2)
      await flushPromises()

      expect(state.isInCart('p1')).toBe(false)
      expect(state.isInCart('p0')).toBe(true)
      expect(state.countFor('e1')).toBe(1)
      expect(toasts('error')).toEqual(['No pudimos agregar la foto. Intenta de nuevo.'])
      expect(message.success).not.toHaveBeenCalled()
    })

    it('takes the photo back out when the network is down', async () => {
      const { state, actions } = await setup()
      http.post.mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'))

      actions.toggle(photo('p1'))
      await flushPromises()

      expect(state.isInCart('p1')).toBe(false)
      expect(toasts('error')).toEqual(['No pudimos agregar la foto. Intenta de nuevo.'])
    })

    it('confirms with a way to open the cart', async () => {
      const { actions } = await setup()

      actions.toggle(photo('p1'))
      await flushPromises()

      expect(toasts('success')).toEqual(['Foto agregada al carrito.Ver carrito'])
      const render = message.success.mock.calls[0]![0] as () => VNode
      const button = (render().children as VNode[]).find(
        (child) => isVNode(child) && child.type === 'button',
      )!
      ;(button.props as { onClick: () => void }).onClick()
      expect(useCartStore().isDrawerOpen).toBe(true)
    })

    it('says the price went down when the photo reaches a tier, and only then', async () => {
      const { actions } = await setup({ inCart: ['p1', 'p2'] })

      // From here on the server has what was added: the cart is read again after each change.
      http.get.mockResolvedValue(serverCart(['p1', 'p2', 'p3']))
      actions.toggle(photo('p3'))
      await flushPromises()
      expect(toasts('success')).toEqual(['Bajaste de precio: todas tus fotos a $3,00 c/u.'])

      message.success.mockClear()
      actions.toggle(photo('p4'))
      await flushPromises()
      expect(toasts('success')).toEqual(['Foto agregada al carrito.Ver carrito'])
    })

    it('keeps to the plain text when the tiers are not there', async () => {
      const { actions } = await setup({ inCart: ['p1', 'p2'], tiers: false })

      actions.toggle(photo('p3'))
      await flushPromises()

      expect(toasts('success')).toEqual(['Foto agregada al carrito.Ver carrito'])
    })
  })

  describe('removing', () => {
    it('takes the photo out before the server answers', async () => {
      const { state, actions } = await setup({ inCart: ['p1', 'p2'] })
      http.delete.mockReturnValue(deferred().promise)

      actions.toggle(photo('p1'))

      expect(state.isInCart('p1')).toBe(false)
      expect(state.photoIdsFor('e1')).toEqual(['p2'])

      await flushPromises()
      expect(http.delete).toHaveBeenCalledWith('/cart/items/p1', {
        params: { sessionId: useCartStore().sessionId },
        silent: true,
      })
    })

    it('puts the photo back, where it was, when the server fails', async () => {
      const { state, actions } = await setup({ inCart: ['p1', 'p2', 'p3'] })
      http.delete.mockRejectedValue(httpError(500))

      actions.remove('p2')
      await flushPromises()

      expect(state.photoIdsFor('e1')).toEqual(['p1', 'p2', 'p3'])
      expect(toasts('error')).toEqual(['No pudimos quitar la foto. Intenta de nuevo.'])
    })

    it('removes by id alone, as the cart drawer does', async () => {
      const { state, actions } = await setup({ inCart: ['p1'] })
      http.get.mockResolvedValue(serverCart([]))

      actions.remove('p1')
      await flushPromises()

      expect(state.totalCount.value).toBe(0)
      expect(state.groups.value).toEqual([])
      expect(toasts('info')).toEqual(['Foto quitada del carrito.'])
    })

    it('does nothing for a photo that is not in the cart', async () => {
      const { actions } = await setup({ inCart: ['p1'] })

      actions.remove('nope')
      await flushPromises()

      expect(http.delete).not.toHaveBeenCalled()
    })

    it('says the price goes back up when leaving a tier with photos left', async () => {
      const { actions } = await setup({ inCart: ['p1', 'p2', 'p3'] })

      actions.remove('p3')
      await flushPromises()

      expect(toasts('info')).toEqual(['Foto quitada. Tus fotos vuelven a $4,00 c/u.'])
    })

    it('counts a photo the server no longer had as removed', async () => {
      const { state, actions } = await setup({ inCart: ['p1'] })
      http.delete.mockRejectedValue(httpError(422, 'cart.no_active_cart'))
      http.get.mockResolvedValue(serverCart([]))

      actions.remove('p1')
      await flushPromises()

      expect(state.isInCart('p1')).toBe(false)
      expect(message.error).not.toHaveBeenCalled()
    })
  })

  describe('quick taps', () => {
    it('sends add then remove, in that order, for two taps on one photo, and ends out of the cart', async () => {
      const { state, actions } = await setup()
      const add = deferred()
      http.post.mockReturnValue(add.promise)
      const order: string[] = []
      http.post.mockImplementation(() => (order.push('POST'), add.promise))
      http.delete.mockImplementation(async () => (order.push('DELETE'), { data: {}, meta: {} }))

      actions.toggle(photo('p1'))
      actions.toggle(photo('p1'))
      expect(state.isInCart('p1')).toBe(false)
      await flushPromises()
      expect(order).toEqual(['POST'])

      add.resolve({ data: {}, meta: {} })
      await flushPromises()

      expect(order).toEqual(['POST', 'DELETE'])
      expect(state.isInCart('p1')).toBe(false)
    })

    it('sends five photos one at a time, never two in flight', async () => {
      const { state, actions } = await setup()
      const requests: ReturnType<typeof deferred>[] = []
      let inFlight = 0
      let most = 0
      http.post.mockImplementation(() => {
        const request = deferred()
        requests.push(request)
        inFlight++
        most = Math.max(most, inFlight)
        return request.promise.finally(() => inFlight--)
      })

      for (const id of ['p1', 'p2', 'p3', 'p4', 'p5']) actions.toggle(photo(id))
      expect(state.countFor('e1')).toBe(5)

      for (let sent = 1; sent <= 5; sent++) {
        await flushPromises()
        expect(http.post).toHaveBeenCalledTimes(sent)
        requests[sent - 1]!.resolve({ data: {}, meta: {} })
      }
      await flushPromises()

      expect(most).toBe(1)
      expect(http.post.mock.calls.map(([, body]) => (body as { photoId: string }).photoId)).toEqual(
        ['p1', 'p2', 'p3', 'p4', 'p5'],
      )
    })

    it('undoes only the photo whose request failed', async () => {
      const { state, actions } = await setup()
      http.post
        .mockResolvedValueOnce({ data: {}, meta: {} })
        .mockRejectedValueOnce(httpError(500))
        .mockResolvedValueOnce({ data: {}, meta: {} })
      http.get.mockResolvedValue(serverCart(['p1', 'p3']))

      actions.toggle(photo('p1'))
      actions.toggle(photo('p2'))
      actions.toggle(photo('p3'))
      await flushPromises()

      expect(state.photoIdsFor('e1')).toEqual(['p1', 'p3'])
      expect(toasts('error')).toHaveLength(1)
    })

    it('leaves the last word to the later tap when an earlier request on the same photo fails', async () => {
      const { state, actions } = await setup()
      const add = deferred()
      http.post.mockReturnValueOnce(add.promise).mockResolvedValue({ data: {}, meta: {} })
      http.delete.mockResolvedValue({ data: {}, meta: {} })
      // Hold the final read back: this is about what the failure itself does to the screen.
      http.get.mockReturnValue(new Promise(() => {}))

      actions.toggle(photo('p1'))
      actions.toggle(photo('p1'))
      actions.toggle(photo('p1'))
      expect(state.isInCart('p1')).toBe(true)

      add.reject(httpError(500))
      await flushPromises()

      // The first add failed, but the person tapped twice more and ended on "in the cart".
      expect(state.isInCart('p1')).toBe(true)
      expect(http.delete).toHaveBeenCalledTimes(1)
      expect(http.post).toHaveBeenCalledTimes(2)
      // Nothing was undone, so there is nothing to apologize for.
      expect(toasts('error')).toEqual([])
    })
  })

  describe('a failure a later tap already made up for', () => {
    it('stays quiet when a failed remove was followed by an add', async () => {
      const { state, actions } = await setup({ inCart: ['p1'] })
      http.delete.mockRejectedValue(httpError(500))
      http.get.mockResolvedValue(serverCart(['p1']))

      actions.toggle(photo('p1'))
      actions.toggle(photo('p1'))
      await flushPromises()

      expect(state.isInCart('p1')).toBe(true)
      expect(toasts('error')).toEqual([])
    })

    it('still says so when the failed change is the last one of the photo', async () => {
      const { state, actions } = await setup()
      http.post.mockResolvedValueOnce({ data: {}, meta: {} }).mockRejectedValueOnce(httpError(500))
      http.get.mockResolvedValue(serverCart([]))

      actions.toggle(photo('p1'))
      actions.toggle(photo('p1'))
      actions.toggle(photo('p1'))
      await flushPromises()

      expect(state.isInCart('p1')).toBe(false)
      expect(toasts('error')).toEqual(['No pudimos agregar la foto. Intenta de nuevo.'])
    })
  })

  describe('when the session expires on the way', () => {
    // What the auth interceptor does when a 401 cannot be renewed.
    function expireOn(mock: typeof http.post) {
      mock.mockImplementation(async () => {
        useSessionStore().expireSession()
        throw new SessionExpiredError()
      })
    }

    it('does not claim a removal the server never made, and says the session expired', async () => {
      useSessionStore().setAccessToken('token')
      const { actions } = await setup({ inCart: ['p1', 'p2'] })
      expireOn(http.delete)

      actions.remove('p1')
      await flushPromises()

      expect(toasts('info')).toEqual([])
      expect(toasts('error')).toEqual([])
      expect(toasts('warning')).toEqual([
        'Tu sesión se cerró. Inicia sesión de nuevo para continuar.',
      ])
    })

    it('does not claim an add the server never made', async () => {
      useSessionStore().setAccessToken('token')
      const { actions } = await setup()
      expireOn(http.post)

      actions.toggle(photo('p1'))
      await flushPromises()

      expect(toasts('success')).toEqual([])
      expect(toasts('error')).toEqual([])
      expect(toasts('warning')).toHaveLength(1)
    })

    it('stops the changes still waiting in line, and says it once', async () => {
      useSessionStore().setAccessToken('token')
      const { actions } = await setup({ inCart: ['p1', 'p2', 'p3'] })
      expireOn(http.delete)

      actions.remove('p1')
      actions.remove('p2')
      actions.toggle(photo('p9'))
      await flushPromises()

      expect(http.delete).toHaveBeenCalledTimes(1)
      expect(http.post).not.toHaveBeenCalled()
      expect(toasts('warning')).toHaveLength(1)
    })
  })

  describe('agreeing with the server afterwards', () => {
    it('asks for the cart once, when the last request is done', async () => {
      const { actions } = await setup()
      const requests = [deferred(), deferred(), deferred()]
      http.post
        .mockReturnValueOnce(requests[0]!.promise)
        .mockReturnValueOnce(requests[1]!.promise)
        .mockReturnValueOnce(requests[2]!.promise)
      http.get.mockResolvedValue(serverCart(['p1', 'p2', 'p3']))

      actions.toggle(photo('p1'))
      actions.toggle(photo('p2'))
      actions.toggle(photo('p3'))
      for (const request of requests) {
        await flushPromises()
        expect(http.get).not.toHaveBeenCalled()
        request.resolve({ data: {}, meta: {} })
      }
      await flushPromises()

      expect(http.get).toHaveBeenCalledTimes(1)
    })

    it('takes what the server says once it has agreed', async () => {
      const { state, actions } = await setup()
      // The server only kept one of the two: its answer wins.
      http.get.mockResolvedValue(serverCart(['p1']))

      actions.toggle(photo('p1'))
      actions.toggle(photo('p2'))
      await flushPromises()

      expect(state.photoIdsFor('e1')).toEqual(['p1'])
    })

    it('does not let a late answer undo a tap made while it was on its way', async () => {
      const { state, actions } = await setup()
      const late = deferred()
      http.get.mockReturnValueOnce(late.promise).mockResolvedValue(serverCart(['p1', 'p2']))

      actions.toggle(photo('p1'))
      await flushPromises()
      expect(http.get).toHaveBeenCalledTimes(1)

      actions.toggle(photo('p2'))
      late.resolve(serverCart(['p1']))
      await flushPromises()

      expect(state.photoIdsFor('e1')).toEqual(['p1', 'p2'])
    })
  })
})
