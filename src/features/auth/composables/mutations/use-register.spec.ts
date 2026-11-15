import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'

const post = vi.fn()
const get = vi.fn()
const runPostLoginTasks = vi.fn()

vi.mock('@/core/http/axios-client', () => ({
  httpClient: {
    post: (...args: unknown[]) => post(...args),
    get: (...args: unknown[]) => get(...args),
  },
}))
vi.mock('@/core/auth/post-login-tasks', () => ({
  runPostLoginTasks: (...args: unknown[]) => runPostLoginTasks(...args),
}))

import { useSessionStore } from '@/core/auth/stores/session.store'
import { useRegisterMutation } from './use-register'

function setup() {
  let mutation!: ReturnType<typeof useRegisterMutation>
  const Host = defineComponent({
    setup() {
      mutation = useRegisterMutation()
      return () => null
    },
  })
  mount(Host, { global: { plugins: [[VueQueryPlugin, { queryClient: new QueryClient() }]] } })
  return mutation
}

const REQUEST = { email: 'nueva@example.test', password: 'Secreta123' } as never

describe('useRegisterMutation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    post.mockReset().mockResolvedValue({ data: { accessToken: 'token-nuevo' } })
    get.mockReset().mockResolvedValue({
      data: {
        id: 'u1',
        email: 'nueva@example.test',
        firstName: 'Ana',
        lastName: null,
        role: 'customer',
        permissions: ['cart.checkout'],
      },
    })
    runPostLoginTasks.mockReset().mockResolvedValue(undefined)
  })

  it('opens the session of the new account', async () => {
    const mutation = setup()

    await mutation.mutateAsync(REQUEST)

    expect(useSessionStore().accessToken).toBe('token-nuevo')
    expect(useSessionStore().currentUser?.email).toBe('nueva@example.test')
  })

  // The photos chosen before having an account go with the new account, as when signing in.
  it('runs what follows a sign-in, with the permissions of the new account', async () => {
    const mutation = setup()

    await mutation.mutateAsync(REQUEST)

    expect(runPostLoginTasks).toHaveBeenCalledWith({ permissions: ['cart.checkout'] })
  })

  it('waits for them before saying the account is ready', async () => {
    let finish: () => void = () => {}
    runPostLoginTasks.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)))
    const mutation = setup()

    let done = false
    const running = mutation.mutateAsync(REQUEST).then(() => (done = true))
    await vi.waitFor(() => expect(runPostLoginTasks).toHaveBeenCalled())
    expect(done).toBe(false)

    finish()
    await running
    expect(done).toBe(true)
  })
})
