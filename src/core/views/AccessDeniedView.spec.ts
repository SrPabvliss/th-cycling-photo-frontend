import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

const logout = vi.fn()
const logoutOptions = vi.fn()
vi.mock('@/core/auth/use-logout', () => ({
  useLogoutMutation: (options?: unknown) => {
    logoutOptions(options)
    return { mutate: logout, isPending: ref(false) }
  },
}))

import AccessDeniedView from './AccessDeniedView.vue'

async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:any(.*)*', component: { render: () => null } }],
  })
  await router.push('/forbidden')
  const wrapper = mount(AccessDeniedView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

const buttonNamed = (wrapper: Awaited<ReturnType<typeof mountView>>, name: string) =>
  wrapper.findAll('button, a').find((each) => each.text() === name)!

describe('AccessDeniedView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    logout.mockReset()
    logoutOptions.mockReset()
  })

  // With a session open the login page sends back to the home page: to sign in with another
  // account, this one has to end first.
  it('signs out and goes to the login page to enter with another account', async () => {
    const wrapper = await mountView()

    await buttonNamed(wrapper, 'Ingresar con otra cuenta').trigger('click')

    expect(logout).toHaveBeenCalledTimes(1)
    expect(logoutOptions).toHaveBeenCalledWith(undefined)
  })
})
