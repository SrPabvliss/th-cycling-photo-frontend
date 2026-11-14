import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { createPinia, setActivePinia } from 'pinia'

import { useSessionStore } from '@/core/auth/stores/session.store'
import { isSessionExpired } from '../session-expired'
import { registerAuthInterceptor } from './auth.interceptor'

const router = vi.hoisted(() => ({
  currentRoute: {
    value: { matched: [{ meta: {} }], meta: { public: true }, fullPath: '/login' } as {
      matched: Array<{ meta: Record<string, unknown> }>
      meta: Record<string, unknown>
      fullPath: string
    },
  },
  resolve: vi.fn(),
  push: vi.fn(),
}))
vi.mock('@/app/router', () => ({ default: router }))

const calls: string[] = []
const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  calls.push(config.url ?? '')
  const response = { status: 401, statusText: '', data: {}, headers: {}, config }
  throw new AxiosError('unauthorized', 'ERR_BAD_REQUEST', config, undefined, response)
}

function client() {
  const instance = axios.create({ adapter })
  registerAuthInterceptor(instance)
  return instance
}

describe('auth interceptor', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    calls.length = 0
    router.push.mockReset()
    router.resolve.mockReset()
  })

  it('tries to renew the session on a 401', async () => {
    await expect(client().get('/orders/me')).rejects.toBeTruthy()

    expect(calls).toEqual(['/orders/me', '/auth/refresh'])
  })

  it('says the session expired, and marks it so, when it cannot be renewed', async () => {
    useSessionStore().setAccessToken('old-token')

    const error = await client()
      .get('/orders/me')
      .catch((reason: unknown) => reason)

    expect(isSessionExpired(error)).toBe(true)
    expect(useSessionStore().isAuthenticated).toBe(false)
    expect(useSessionStore().expired).toBe(true)
  })

  it('keeps the session when the refresh works and only the retried request fails', async () => {
    useSessionStore().setAccessToken('old-token')
    let tries = 0
    const instance = axios.create({
      adapter: async (config) => {
        calls.push(config.url ?? '')
        if (config.url === '/auth/refresh') {
          return {
            status: 200,
            statusText: '',
            data: { data: { accessToken: 'new-token' } },
            headers: {},
            config,
          }
        }
        tries += 1
        const status = tries === 1 ? 401 : 500
        const response = { status, statusText: '', data: {}, headers: {}, config }
        throw new AxiosError('failed', 'ERR_BAD_RESPONSE', config, undefined, response)
      },
    })
    registerAuthInterceptor(instance)

    const error = await instance.get('/orders/me').catch((reason: unknown) => reason)

    expect((error as AxiosError).response?.status).toBe(500)
    expect(isSessionExpired(error)).toBe(false)
    expect(useSessionStore().isAuthenticated).toBe(true)
    expect(useSessionStore().expired).toBe(false)
  })

  it('leaves a 401 alone when the request asks for it (rejected credentials)', async () => {
    const error = await client()
      .post('/auth/login', {}, { skipAuthRetry: true } as never)
      .catch((reason: unknown) => reason)

    expect(calls).toEqual(['/auth/login'])
    expect((error as AxiosError).response?.status).toBe(401)
  })

  describe('when the session cannot be renewed', () => {
    it('sends a panel screen to sign in, as before', async () => {
      router.currentRoute.value = {
        matched: [{ meta: { area: 'panel' } }],
        meta: {},
        fullPath: '/orders?status=paid',
      }

      await client()
        .get('/orders')
        .catch(() => undefined)

      expect(router.push).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/orders?status=paid' },
      })
    })

    it('sends to sign in on the first navigation, before any screen is up', async () => {
      router.currentRoute.value = { matched: [], meta: {}, fullPath: '/' }
      router.resolve.mockReturnValue({
        matched: [{ meta: {} }],
        meta: {},
        fullPath: '/account/orders',
      })

      await client()
        .get('/orders/me')
        .catch(() => undefined)

      expect(router.push).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/account/orders' },
      })
    })

    it('stays on a client screen already up: the screen says the session closed', async () => {
      router.currentRoute.value = {
        matched: [{ meta: {} }],
        meta: {},
        fullPath: '/account/orders?page=2',
      }

      await client()
        .get('/orders/me')
        .catch(() => undefined)

      expect(router.push).not.toHaveBeenCalled()
      expect(useSessionStore().expired).toBe(true)
    })
  })
})
