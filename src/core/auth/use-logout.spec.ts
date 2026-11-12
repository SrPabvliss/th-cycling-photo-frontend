import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { toCurrentUser } from './current-user.mapper'
import { useSessionStore } from './stores/session.store'
import { useLogoutMutation, type ILogoutOptions } from './use-logout'

const post = vi.fn()

vi.mock('@/core/http/axios-client', () => ({
  httpClient: { post: (...args: unknown[]) => post(...args) },
}))

const Stub = { render: () => null }

async function signOutFrom(path: string, options?: ILogoutOptions) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/gallery', component: Stub },
      { path: '/login', component: Stub },
      { path: '/', component: Stub },
    ],
  })
  await router.push(path)

  let run: () => Promise<unknown> = async () => {}
  const Host = defineComponent({
    setup() {
      run = useLogoutMutation(options).mutateAsync
      return () => h('div')
    },
  })
  mount(Host, {
    global: { plugins: [router, [VueQueryPlugin, { queryClient: new QueryClient() }]] },
  })

  await run().catch(() => {})
  await flushPromises()

  return router
}

describe('useLogoutMutation', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    post.mockReset().mockResolvedValue({ data: null })
    useSessionStore().setSession(
      'token',
      toCurrentUser({
        id: 'u1',
        email: 'a@b.c',
        firstName: 'Ana',
        lastName: null,
        role: 'customer',
      }),
    )
  })

  it('clears the session and goes to the login page by default, as the panel expects', async () => {
    const router = await signOutFrom('/gallery')

    expect(useSessionStore().isAuthenticated).toBe(false)
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('goes where it is told', async () => {
    const router = await signOutFrom('/gallery', { redirectTo: '/' })

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('stays put when told not to redirect', async () => {
    const router = await signOutFrom('/gallery', { redirectTo: null })

    expect(useSessionStore().isAuthenticated).toBe(false)
    expect(router.currentRoute.value.path).toBe('/gallery')
  })

  it('clears the session even when the server does not answer', async () => {
    post.mockRejectedValue(new Error('network'))

    const router = await signOutFrom('/gallery', { redirectTo: null })

    expect(useSessionStore().isAuthenticated).toBe(false)
    expect(router.currentRoute.value.path).toBe('/gallery')
  })
})
