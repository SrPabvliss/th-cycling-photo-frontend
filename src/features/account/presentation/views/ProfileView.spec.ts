import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import ProfileView from './ProfileView.vue'

const state = reactive({
  status: 'success' as 'pending' | 'error' | 'success',
  accounts: 2,
})
const refetch = vi.fn()

vi.mock('../../composables/queries/use-my-profile', () => ({
  useMyProfileQuery: () => ({
    status: computed(() => state.status),
    data: computed(() =>
      state.status === 'success'
        ? {
            id: 'u1',
            email: 'ana@correo.com',
            firstName: 'Ana',
            lastName: 'Paz',
            avatarUrl: '',
            countryId: 50,
            provinceId: null,
            cantonId: null,
            birthDate: null,
            gender: null,
            phones: [{ id: 'p1' }, { id: 'p2' }],
          }
        : undefined,
    ),
    isFetching: ref(false),
    refetch,
  }),
}))
vi.mock('../../composables/queries/use-my-billing-accounts', () => ({
  useMyBillingAccountsQuery: () => ({
    data: computed(() => ({
      accounts: Array.from({ length: state.accounts }, (_, index) => ({ id: `b${index}` })),
      invoiceConsentGiven: true,
    })),
  }),
}))
vi.mock('@/core/auth/use-logout', () => ({
  useLogoutMutation: () => ({ mutateAsync: vi.fn(), isPending: ref(false) }),
}))

const SECTION_STUBS = {
  PersonalDataSection: { template: '<div data-test="body-datos" />' },
  PhoneList: { template: '<div data-test="body-tels" />' },
  EmailSection: { template: '<div data-test="body-correo" />' },
  PasswordForm: { template: '<div data-test="body-clave" />' },
  BillingSection: { template: '<div data-test="body-fact" />' },
  ProfileContent: { template: '<div data-test="organizer" />' },
}

const mounted: { unmount(): void }[] = []
async function mountView(path = '/account/profile', permissions = ['cart.checkout']) {
  useSessionStore().setSession(
    'token',
    toCurrentUser({
      id: 'u1',
      email: 'ana@correo.com',
      firstName: 'Ana',
      lastName: 'Paz',
      role: 'customer',
      permissions,
      emailVerified: false,
    } as never),
  )
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/account/profile', component: ProfileView },
      { path: '/:any(.*)*', component: { render: () => null } },
    ],
  })
  await router.push(path)
  mounted.push(
    mount(
      { template: '<RouterView />' },
      { attachTo: document.body, global: { plugins: [router], stubs: SECTION_STUBS } },
    ),
  )
  await flushPromises()
  return { wrapper: new DOMWrapper(document.body), router }
}

const head = (wrapper: DOMWrapper<Element>, title: string) =>
  wrapper.findAll('button[aria-expanded]').find((each) => each.text().includes(title))!

describe('ProfileView (buyer)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    setActivePinia(createPinia())
    localStorage.clear()
    Object.assign(state, { status: 'success', accounts: 2 })
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('shows who is signed in and every section, all closed', async () => {
    const { wrapper } = await mountView()

    expect(wrapper.get('h1').text()).toBe('Mi perfil')
    expect(wrapper.text()).toContain('Ana Paz')
    expect(wrapper.text()).toContain('ana@correo.com')
    expect(wrapper.text()).toContain('Correo sin confirmar')
    const titles = wrapper.findAll('button[aria-expanded]').map((each) => each.text())
    expect(titles[0]).toContain('Datos personales')
    expect(titles[1]).toContain('Teléfonos')
    expect(titles[1]).toContain('2 números')
    expect(titles[2]).toContain('Correo')
    expect(titles[2]).toContain('Sin verificar')
    expect(titles[3]).toContain('Contraseña')
    expect(titles[4]).toContain('Datos de facturación')
    expect(titles[4]).toContain('2 guardados')
    expect(wrapper.findAll('[aria-expanded="true"]')).toHaveLength(0)
    expect(wrapper.findAll('button').some((each) => each.text() === 'Cerrar sesión')).toBe(true)
  })

  it('opens one section at a time and keeps it in the address', async () => {
    const { wrapper, router } = await mountView()

    await head(wrapper, 'Teléfonos').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.seccion).toBe('tels')
    expect(wrapper.find('[data-test="body-tels"]').exists()).toBe(true)

    await head(wrapper, 'Contraseña').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.seccion).toBe('clave')
    expect(head(wrapper, 'Teléfonos').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-test="body-tels"]').exists()).toBe(false)

    await head(wrapper, 'Contraseña').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.seccion).toBeUndefined()
  })

  it('opens the section named in the address', async () => {
    const { wrapper } = await mountView('/account/profile?seccion=fact')

    expect(head(wrapper, 'Datos de facturación').attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('#perfil-fact').attributes('hidden')).toBeUndefined()
  })

  it('says when there is no billing data', async () => {
    state.accounts = 0
    const { wrapper } = await mountView()

    expect(head(wrapper, 'Datos de facturación').text()).toContain('Ninguno')
  })

  it('shows the shape of the profile while it loads', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    state.status = 'pending'
    const { wrapper } = await mountView()
    await vi.advanceTimersByTimeAsync(500)
    vi.useRealTimers()

    expect(wrapper.find('[aria-label="Cargando tu perfil"]').exists()).toBe(true)
  })

  it('offers to retry when the profile could not be loaded', async () => {
    state.status = 'error'
    const { wrapper } = await mountView()

    await wrapper
      .findAll('button')
      .find((each) => each.text().includes('Reintentar'))!
      .trigger('click')
    expect(refetch).toHaveBeenCalled()
  })

  it('leaves the organizer profile as it is', async () => {
    const { wrapper } = await mountView('/account/profile', ['event.read', 'order.read'])

    expect(wrapper.find('[data-test="organizer"]').exists()).toBe(true)
    expect(wrapper.find('h1').exists()).toBe(false)
  })
})
