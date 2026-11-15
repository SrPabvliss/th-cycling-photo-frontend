import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'

import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { LAYOUT_SLOTS, registerLayoutSlot } from '@/core/layout/slot-registry'
import { ROUTE_NAMES } from '@/core/navigation/route-names'
import ClientHeader from './ClientHeader.vue'

const Stub = { render: () => null }

const AccountMenuStub = defineComponent({
  name: 'AccountMenu',
  props: { show: Boolean },
  render() {
    return h('div', { 'data-test': 'account-menu', 'data-show': String(this.show) })
  },
})

registerLayoutSlot(
  LAYOUT_SLOTS.PUBLIC_NAV_ACTION,
  defineComponent({ render: () => h('button', { 'data-test': 'slot-action' }, 'carrito') }),
)
registerLayoutSlot(
  LAYOUT_SLOTS.PUBLIC_NAV_OVERLAY,
  defineComponent({ render: () => h('aside', { 'data-test': 'slot-overlay' }) }),
)

function buildRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub, meta: { shell: { tab: 'home' } } },
      { path: '/gallery', component: Stub, meta: { shell: { tab: 'events' } } },
      {
        path: '/account/orders',
        name: ROUTE_NAMES.ACCOUNT_ORDERS,
        component: Stub,
        meta: { shell: { tab: 'photos' } },
      },
      { path: '/login', component: Stub },
    ],
  })
}

function signIn(firstName: string | null = 'María', lastName: string | null = 'Pérez') {
  useSessionStore().setSession(
    'token',
    toCurrentUser({ id: 'u1', email: 'maria@example.com', firstName, lastName, role: 'customer' }),
  )
}

async function mountHeader(path = '/') {
  const router = buildRouter()
  await router.push(path)
  const wrapper = mount(ClientHeader, {
    global: { plugins: [router], stubs: { AccountMenu: AccountMenuStub } },
  })
  await flushPromises()
  return { wrapper, router }
}

const navLinks = (wrapper: Awaited<ReturnType<typeof mountHeader>>['wrapper']) =>
  wrapper.get('nav[aria-label="Navegación principal"]').findAll('a')

describe('ClientHeader', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  it('offers to sign in, and shows no avatar, without a session', async () => {
    const { wrapper } = await mountHeader()

    const signInLink = wrapper.get('[data-test="header-sign-in"]')
    expect(signInLink.text()).toBe('Ingresar')
    expect(signInLink.attributes('href')).toBe('/login')
    expect(wrapper.find('[data-test="header-account"]').exists()).toBe(false)
  })

  it('shows the avatar with the first name, and no sign in, with a session', async () => {
    signIn()
    const { wrapper } = await mountHeader()

    const account = wrapper.get('[data-test="header-account"]')
    expect(account.text()).toContain('M')
    expect(account.get('.client-header__name').text()).toBe('María')
    expect(account.attributes('aria-label')).toBe('Abrir cuenta')
    expect(wrapper.find('[data-test="header-sign-in"]').exists()).toBe(false)
  })

  it('still shows an avatar when the session carries no name', async () => {
    signIn(null, null)
    const { wrapper } = await mountHeader()

    const account = wrapper.get('[data-test="header-account"]')
    expect(account.find('svg').exists()).toBe(true)
    expect(account.find('.client-header__name').exists()).toBe(false)
  })

  it('opens the account menu from the avatar', async () => {
    signIn()
    const { wrapper } = await mountHeader()
    const account = wrapper.get('[data-test="header-account"]')
    expect(account.attributes('aria-expanded')).toBe('false')

    await account.trigger('click')

    expect(account.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('[data-test="account-menu"]').attributes('data-show')).toBe('true')
  })

  it('has the three destinations, in order', async () => {
    const { wrapper } = await mountHeader()

    expect(navLinks(wrapper).map((link) => [link.text(), link.attributes('href')])).toEqual([
      ['Inicio', '/'],
      ['Eventos', '/gallery'],
      ['Mis fotos', '/account/orders'],
    ])
  })

  it('marks as current only the destination of the route', async () => {
    const { wrapper } = await mountHeader('/gallery')

    const current = navLinks(wrapper).filter((link) => link.attributes('aria-current') === 'page')
    expect(current.map((link) => link.text())).toEqual(['Eventos'])
  })

  it('marks nothing as current on a route that belongs to no destination', async () => {
    const { wrapper } = await mountHeader('/login')

    expect(navLinks(wrapper).some((link) => link.attributes('aria-current'))).toBe(false)
  })

  it('navigates without reloading the page', async () => {
    const { wrapper, router } = await mountHeader()

    await navLinks(wrapper)[1]!.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/gallery')
  })

  it('links the logo to the home page', async () => {
    const { wrapper } = await mountHeader('/gallery')

    const logo = wrapper.get('a[aria-label="Titan TV, inicio"]')
    expect(logo.attributes('href')).toBe('/')
    expect(logo.text()).toBe('TITAN TV')
  })

  it('renders what other features registered for the header: the cart button and its drawer', async () => {
    const { wrapper } = await mountHeader()

    expect(wrapper.find('[data-test="slot-action"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="slot-overlay"]').exists()).toBe(true)
  })
})
