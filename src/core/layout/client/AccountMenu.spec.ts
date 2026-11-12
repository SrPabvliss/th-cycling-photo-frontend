import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { PERMISSIONS } from '@/core/auth/permissions'
import { useHatStore } from '@/core/auth/stores/hat.store'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { useColorSchemeStore } from '@/core/theme/color-scheme.store'
import AccountMenu from './AccountMenu.vue'

const logout = vi.fn()
const logoutOptions = vi.fn()

vi.mock('@/core/auth/use-logout', () => ({
  useLogoutMutation: (options: unknown) => {
    logoutOptions(options)
    return { mutateAsync: logout }
  },
}))

const Screen = (text: string) => defineComponent({ render: () => h('p', text) })

function signIn(permissions: string[] = [PERMISSIONS.CART_CHECKOUT]) {
  useSessionStore().setSession(
    'token',
    toCurrentUser({
      id: 'u1',
      email: 'maria@example.com',
      firstName: 'María',
      lastName: 'Pérez',
      role: 'customer',
      permissions,
    }),
  )
}

async function mountMenu(path = '/gallery') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Screen('inicio') },
      { path: '/gallery', component: Screen('eventos') },
      { path: '/events', component: Screen('panel') },
      {
        path: '/account/orders',
        component: Screen('mis fotos'),
        meta: { requiresAuth: true },
      },
      {
        path: '/account/profile',
        name: ROUTE_NAMES.ACCOUNT_PROFILE,
        component: Screen('perfil'),
        meta: { requiresAuth: true },
      },
    ],
  })
  await router.push(path)

  // The header owns the open state and the avatar button; this stands in for it.
  const Host = defineComponent({
    setup() {
      const show = ref(true)
      const trigger = ref<HTMLButtonElement | null>(null)
      return () =>
        h('div', [
          h('button', { ref: trigger, 'data-test': 'trigger', onClick: () => (show.value = true) }),
          h(AccountMenu, {
            id: 'account-menu',
            show: show.value,
            trigger: trigger.value,
            'onUpdate:show': (value: boolean) => (show.value = value),
          }),
        ])
    },
  })

  const wrapper = mount(Host, {
    attachTo: document.body,
    global: { plugins: [router], stubs: { teleport: true } },
  })
  await flushPromises()

  return { wrapper, router }
}

type Wrapper = Awaited<ReturnType<typeof mountMenu>>['wrapper']

const menu = (wrapper: Wrapper) => wrapper.find('[role="menu"]')
const item = (wrapper: Wrapper, name: string) => {
  const found = wrapper
    .findAll('[role="menuitem"], [role="menuitemcheckbox"]')
    .find((candidate) => candidate.text() === name)
  if (!found) throw new Error(`no menu item named "${name}"`)
  return found
}
const itemNames = (wrapper: Wrapper) =>
  wrapper.findAll('[role="menuitem"], [role="menuitemcheckbox"]').map((found) => found.text())

describe('AccountMenu', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
    setActivePinia(createPinia())
    logout.mockReset().mockResolvedValue(undefined)
    logoutOptions.mockClear()
    signIn()
  })

  it('shows who is signed in', async () => {
    const { wrapper } = await mountMenu()

    expect(menu(wrapper).text()).toContain('María Pérez')
    expect(menu(wrapper).text()).toContain('maria@example.com')
  })

  it('has no organizer mode for someone who cannot operate', async () => {
    const { wrapper } = await mountMenu()

    expect(itemNames(wrapper)).toEqual(['Mi perfil', 'Modo oscuro', 'Cerrar sesión'])
  })

  it('offers the organizer mode to someone who can operate, and takes them to the panel', async () => {
    signIn([PERMISSIONS.CART_CHECKOUT, PERMISSIONS.EVENT_READ])
    const { wrapper, router } = await mountMenu()
    expect(itemNames(wrapper)).toEqual([
      'Mi perfil',
      'Modo oscuro',
      'Modo organizador',
      'Cerrar sesión',
    ])

    await item(wrapper, 'Modo organizador').trigger('click')
    await flushPromises()

    expect(useHatStore().activeHat).toBe('operating')
    expect(router.currentRoute.value.path).toBe('/events')
    expect(menu(wrapper).exists()).toBe(false)
  })

  it('switches the color scheme and stays open', async () => {
    const scheme = useColorSchemeStore()
    const toggle = vi.spyOn(scheme, 'toggle')
    const { wrapper } = await mountMenu()
    expect(item(wrapper, 'Modo oscuro').attributes('aria-checked')).toBe('false')

    await item(wrapper, 'Modo oscuro').trigger('click')

    expect(toggle).toHaveBeenCalledTimes(1)
    expect(item(wrapper, 'Modo oscuro').attributes('aria-checked')).toBe('true')
    expect(menu(wrapper).exists()).toBe(true)
  })

  it('goes to the profile and closes', async () => {
    const { wrapper, router } = await mountMenu()

    await item(wrapper, 'Mi perfil').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/account/profile')
    expect(menu(wrapper).exists()).toBe(false)
  })

  it('signs out without the jump to the login page the panel makes', async () => {
    await mountMenu()

    expect(logoutOptions).toHaveBeenCalledWith({ redirectTo: null })
  })

  it('signs out from a screen that needs a session and ends on the home page', async () => {
    const { wrapper, router } = await mountMenu('/account/orders')

    await item(wrapper, 'Cerrar sesión').trigger('click')
    await flushPromises()

    expect(logout).toHaveBeenCalledTimes(1)
    expect(router.currentRoute.value.path).toBe('/')
    expect(menu(wrapper).exists()).toBe(false)
  })

  it('signs out from a public screen and stays there', async () => {
    const { wrapper, router } = await mountMenu('/gallery')

    await item(wrapper, 'Cerrar sesión').trigger('click')
    await flushPromises()

    expect(logout).toHaveBeenCalledTimes(1)
    expect(router.currentRoute.value.path).toBe('/gallery')
    expect(menu(wrapper).exists()).toBe(false)
  })

  it('still leaves the private screen when the sign out request fails', async () => {
    logout.mockRejectedValue(new Error('network'))
    const { wrapper, router } = await mountMenu('/account/orders')

    await item(wrapper, 'Cerrar sesión').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('takes the focus when it opens', async () => {
    const { wrapper } = await mountMenu()

    expect(document.activeElement).toBe(item(wrapper, 'Mi perfil').element)
  })

  it('moves the focus with the arrow keys, around the ends', async () => {
    const { wrapper } = await mountMenu()

    await menu(wrapper).trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(item(wrapper, 'Modo oscuro').element)

    await menu(wrapper).trigger('keydown', { key: 'ArrowUp' })
    await menu(wrapper).trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(item(wrapper, 'Cerrar sesión').element)

    await menu(wrapper).trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(item(wrapper, 'Mi perfil').element)
  })

  it('closes with Escape and gives the focus back to the avatar button', async () => {
    const { wrapper } = await mountMenu()

    await menu(wrapper).trigger('keydown', { key: 'Escape' })
    await flushPromises()

    expect(menu(wrapper).exists()).toBe(false)
    expect(document.activeElement).toBe(wrapper.get('[data-test="trigger"]').element)
  })

  it('closes when tapping outside', async () => {
    const { wrapper } = await mountMenu()

    await wrapper.get('.account-menu__scrim').trigger('click')

    expect(menu(wrapper).exists()).toBe(false)
  })

  it('closes when the route changes under it', async () => {
    const { wrapper, router } = await mountMenu()

    await router.push('/')
    await flushPromises()

    expect(menu(wrapper).exists()).toBe(false)
  })
})
