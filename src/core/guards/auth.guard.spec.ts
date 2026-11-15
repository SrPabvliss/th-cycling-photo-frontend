import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { AxiosError, type AxiosResponse } from 'axios'
import { createMemoryHistory, createRouter } from 'vue-router'

const get = vi.fn()
vi.mock('@/core/http/axios-client', () => ({
  httpClient: { get: (...args: unknown[]) => get(...args) },
}))

import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { registerAuthGuard } from './auth.guard'

const BUYER = {
  id: 'u1',
  email: 'a@b.c',
  firstName: 'Ana',
  lastName: null,
  role: 'customer',
  permissions: ['cart.checkout'],
}

async function navigate(path: string) {
  const Screen = { render: () => null }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Screen, meta: { public: true } },
      { path: '/login', component: Screen, meta: { public: true } },
      { path: '/register', component: Screen, meta: { public: true } },
      { path: '/account/orders', component: Screen },
      { path: '/gallery/:slug', component: Screen, meta: { public: true } },
    ],
  })
  registerAuthGuard(router)
  await router.push(path)
  return router.currentRoute.value.fullPath
}

describe('auth guard', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    get.mockReset().mockResolvedValue({ data: BUYER })
  })

  describe('with a session open', () => {
    beforeEach(() => useSessionStore().setSession('token', toCurrentUser(BUYER)))

    it.each(['/login', '/register'])('takes %s to where the link meant to go', async (page) => {
      expect(await navigate(`${page}?redirect=/account/orders`)).toBe('/account/orders')
    })

    it('goes home when there is no destination, or one outside the site', async () => {
      expect(await navigate('/login')).toBe('/')
      expect(await navigate('/login?redirect=//evil.example')).toBe('/')
      expect(await navigate('/login?redirect=https://evil.example')).toBe('/')
    })

    it('never goes back to the login page itself', async () => {
      expect(await navigate('/login?redirect=/login')).toBe('/')
      expect(await navigate('/register?redirect=%2Fregister%3Fredirect%3D%2F')).toBe('/')
    })
  })

  it('opens the login page without a session', async () => {
    expect(await navigate('/login?redirect=/account/orders')).toBe(
      '/login?redirect=/account/orders',
    )
  })

  describe('when the session cannot be read on arrival', () => {
    const tooMany = () => {
      const response = { status: 429, data: {}, headers: {}, config: {} } as AxiosResponse
      return new AxiosError('too many', 'ERR_BAD_REQUEST', undefined, undefined, response)
    }

    // A fresh app: the session is read on the first navigation only.
    async function arrive(path: string) {
      vi.resetModules()
      localStorage.setItem('titan_access_token', 'old-token')
      setActivePinia(createPinia())
      const { registerAuthGuard: register } = await import('./auth.guard')
      const { useSessionStore: store } = await import('@/core/auth/stores/session.store')
      const Screen = { render: () => null }
      const router = createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: '/', component: Screen, meta: { public: true } },
          { path: '/login', component: Screen, meta: { public: true } },
          { path: '/account/orders', component: Screen },
        ],
      })
      register(router)
      await router.push(path)
      return { path: router.currentRoute.value.fullPath, session: store() }
    }

    // Too many tries or no answer say nothing about the session: it stays, and is read again on
    // the next screen.
    it('keeps the session, and the screen that needs it, when it was only too many tries', async () => {
      get.mockReset().mockRejectedValueOnce(tooMany()).mockResolvedValue({ data: BUYER })

      const { path, session } = await arrive('/account/orders')

      expect(path).toBe('/account/orders')
      expect(session.isAuthenticated).toBe(true)
    })

    it('ends it when it expired', async () => {
      // Imported when it is thrown: the fresh app has its own copy of the class.
      get.mockReset().mockImplementation(async () => {
        const { SessionExpiredError } = await import('@/core/http/session-expired')
        throw new SessionExpiredError()
      })

      const { path, session } = await arrive('/account/orders')

      expect(path).toBe('/login?redirect=/account/orders')
      expect(session.isAuthenticated).toBe(false)
    })
  })
})
