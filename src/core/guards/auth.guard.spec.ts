import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
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
})
