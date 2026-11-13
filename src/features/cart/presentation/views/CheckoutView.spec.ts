import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import type { ICartGroup } from '@/shared/types/cart.types'
import type { CheckoutProblem } from '@/shared/utils/checkout-error'
import CheckoutView from './CheckoutView.vue'

const REAL_TIERS = [
  { minQty: 1, maxQty: 2, pricePerPhoto: 4 },
  { minQty: 3, maxQty: 6, pricePerPhoto: 3 },
  { minQty: 7, maxQty: 9, pricePerPhoto: 2.5 },
  { minQty: 10, maxQty: null, pricePerPhoto: 2 },
]

const ACCOUNT = {
  id: 'b1',
  idType: 'national_id' as const,
  idNumber: '1710034065',
  legalName: 'Juan Pérez',
  email: 'juan@correo.com',
  address: null,
  isDefault: true,
}

const state = reactive({
  cartStatus: 'success' as 'pending' | 'error' | 'success',
  groups: [] as ICartGroup[],
  hasTiers: true,
  cardAvailable: false as boolean | undefined,
  accounts: [ACCOUNT] as (typeof ACCOUNT)[],
  needsConsent: false,
})
const consentChecked = ref(false)
const problem = ref<CheckoutProblem | null>(null)
const isPlacing = ref(false)
const place = vi.fn()
const remove = vi.fn()
const refetchCart = vi.fn()
const refreshBilling = vi.fn()

vi.mock('@/shared/cart', () => ({
  useCartState: () => ({
    status: computed(() => state.cartStatus),
    groups: computed(() => state.groups),
    isFetching: computed(() => false),
    refetch: refetchCart,
  }),
  useCartActions: () => ({ toggle: vi.fn(), remove, isBusy: () => false }),
}))
vi.mock('@/shared/pricing/use-pricing-tiers', () => ({
  usePricingTiersQuery: () => ({
    data: computed(() =>
      state.hasTiers ? { currency: 'USD', source: 'default', tiers: REAL_TIERS } : undefined,
    ),
  }),
}))
vi.mock('@/shared/composables/use-event-payment-options', () => ({
  useEventPaymentOptionsQuery: () => ({
    data: computed(() =>
      state.cardAvailable === undefined ? undefined : { cardAvailable: state.cardAvailable },
    ),
    isLoading: computed(() => state.cardAvailable === undefined),
  }),
}))
vi.mock('@/features/account/composables/use-billing-selection', () => ({
  useBillingSelection: () => ({
    billingAccounts: computed(() => state.accounts),
    needsInvoiceConsent: computed(() => state.needsConsent),
    selectedBillingAccountId: computed(() => state.accounts[0]?.id ?? null),
    invoiceConsentChecked: consentChecked,
    billingSheet: ref(null),
    billingPrefill: computed(() => ({ legalName: '', email: '' })),
    isBillingReady: computed(
      () => state.accounts.length > 0 && (!state.needsConsent || consentChecked.value),
    ),
    isSettingDefault: ref(false),
    isRecordingConsent: ref(false),
    handleBillingSaved: vi.fn(),
    handleBillingChosen: vi.fn(),
    ensureInvoiceConsent: vi.fn(),
    refreshBilling,
  }),
}))
vi.mock('../../composables/use-place-order', () => ({
  usePlaceOrder: () => ({ place, isPlacing, problem, reset: () => (problem.value = null) }),
}))

function group(photos: number): ICartGroup {
  return {
    eventId: 'e1',
    eventName: 'Mama Rumi 2026',
    eventSlug: 'mama-rumi',
    startDate: new Date(2026, 9, 4),
    endDate: new Date(2026, 9, 5),
    photos: Array.from({ length: photos }, (_, index) => ({
      id: `p${index}`,
      publicSlug: `s${index}`,
    })),
  }
}

function signIn() {
  useSessionStore().setSession(
    'token',
    toCurrentUser({ id: 'u1', email: 'a@b.c', firstName: 'Ana', lastName: null, role: 'customer' }),
  )
}

const Stub = { render: () => null }
const mounted: { unmount(): void }[] = []

async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/gallery', component: Stub },
      { path: '/gallery/:slug', component: Stub },
      { path: '/login', component: Stub },
      { path: '/account/orders', name: 'account-orders', component: Stub },
      { path: '/account/profile', name: 'account-profile', component: Stub },
      { path: '/checkout/:eventId', component: CheckoutView },
      { path: '/checkout/:eventId/method', component: Stub },
      { path: '/checkout/received/:orderId', component: Stub },
    ],
  })
  await router.push('/checkout/e1')
  const component = mount(CheckoutView, { attachTo: document.body, global: { plugins: [router] } })
  mounted.push(component)
  await flushPromises()
  return { wrapper: new DOMWrapper(document.body), router }
}

type Wrapper = Awaited<ReturnType<typeof mountView>>['wrapper']
const buttonNamed = (wrapper: Wrapper, name: string) =>
  wrapper.findAll('button, a').find((each) => each.text().replace(/\s+/g, ' ').trim() === name)
const primary = (wrapper: Wrapper) => wrapper.get('[data-test="checkout-confirm"]')

describe('CheckoutView', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    localStorage.clear()
    setActivePinia(createPinia())
    Object.assign(state, {
      cartStatus: 'success',
      groups: [group(3)],
      hasTiers: true,
      cardAvailable: false,
      accounts: [ACCOUNT],
      needsConsent: false,
    })
    consentChecked.value = false
    problem.value = null
    isPlacing.value = false
    place.mockReset()
    remove.mockReset()
    refetchCart.mockReset()
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('says there are no photos for this event, and sends back to the gallery', async () => {
    state.groups = []
    const { wrapper } = await mountView()

    expect(wrapper.text()).toContain('No hay fotos en este pedido')
    expect(wrapper.text()).toContain('Vuelve a la galería y agrega las fotos que quieras.')
    expect(buttonNamed(wrapper, 'Volver a la galería')?.attributes('href')).toBe('/gallery')
  })

  it('says the cart could not be loaded, never that it is empty', async () => {
    state.cartStatus = 'error'
    state.groups = []
    const { wrapper } = await mountView()

    expect(wrapper.text()).toContain('No pudimos cargar tu carrito')
    expect(wrapper.text()).not.toContain('No hay fotos en este pedido')
  })

  it('shows the order: event, photos, price per photo and total', async () => {
    signIn()
    const { wrapper } = await mountView()

    expect(wrapper.get('h1').text()).toBe('Confirmar pedido')
    expect(wrapper.text()).toContain('Mama Rumi 2026')
    expect(wrapper.findAll('.order-summary__thumb')).toHaveLength(3)
    expect(wrapper.get('.order-summary__unit').text()).toContain('$3,00')
    expect(wrapper.get('.order-summary__total').text()).toBe('$9,00')
    expect(wrapper.text()).toContain('Con 4 fotos más, todas bajan a $2,50 c/u')
  })

  it('asks to sign in first, keeping the photos, without a session', async () => {
    const { wrapper } = await mountView()

    expect(wrapper.text()).toContain('Inicia sesión para comprar')
    expect(wrapper.text()).toContain('Tus 3 fotos se quedan guardadas en el carrito.')
    expect(buttonNamed(wrapper, 'Iniciar sesión para continuar')?.attributes('href')).toBe(
      '/login?redirect=/checkout/e1',
    )
    expect(wrapper.find('[data-test="checkout-confirm"]').exists()).toBe(false)
  })

  it('keeps the order button off, and says why, without billing data', async () => {
    signIn()
    state.accounts = []
    const { wrapper } = await mountView()

    expect(primary(wrapper).text()).toBe('Confirmar pedido · $9,00')
    expect(primary(wrapper).attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Agrega tus datos de facturación para confirmar.')
  })

  it('asks for the invoice consent, and allows the order once it is ticked', async () => {
    signIn()
    state.needsConsent = true
    const { wrapper } = await mountView()

    const box = wrapper.get('[data-test="billing-card-consent"] input')
    expect(primary(wrapper).attributes('disabled')).toBeDefined()

    await box.setValue(true)
    await flushPromises()

    expect(consentChecked.value).toBe(true)
    expect(primary(wrapper).attributes('disabled')).toBeUndefined()
  })

  it('goes to choose the payment method when the event takes cards', async () => {
    signIn()
    state.cardAvailable = true
    const { wrapper, router } = await mountView()

    expect(primary(wrapper).text()).toBe('Continuar al pago · $9,00')
    await primary(wrapper).trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/checkout/e1/method')
    expect(place).not.toHaveBeenCalled()
  })

  it('creates the transfer order and opens it, when the event takes no cards', async () => {
    signIn()
    place.mockResolvedValue([
      { orderId: 'o9', eventName: 'x', photoCount: 3, subtotal: 9, currency: 'USD' },
    ])
    const { wrapper, router } = await mountView()

    expect(primary(wrapper).text()).toBe('Confirmar pedido · $9,00')
    expect(wrapper.text()).toContain(
      'Este evento se paga por transferencia. Al confirmar, te escribimos por WhatsApp con el total y los datos para pagar.',
    )
    await primary(wrapper).trigger('click')
    await flushPromises()

    expect(place).toHaveBeenCalledWith({
      eventId: 'e1',
      method: 'transfer',
      billingAccountId: 'b1',
      recordConsent: false,
    })
    expect(router.currentRoute.value.path).toBe('/checkout/received/o9')
  })

  it('records the ticked consent with the order', async () => {
    signIn()
    state.needsConsent = true
    consentChecked.value = true
    place.mockResolvedValue([
      { orderId: 'o9', eventName: 'x', photoCount: 3, subtotal: 9, currency: 'USD' },
    ])
    const { wrapper } = await mountView()

    await primary(wrapper).trigger('click')

    expect(place).toHaveBeenCalledWith(expect.objectContaining({ recordConsent: true }))
  })

  it('shows the button busy while the order is on its way', async () => {
    signIn()
    isPlacing.value = true
    const { wrapper } = await mountView()

    expect(primary(wrapper).attributes('disabled')).toBeDefined()
    expect(primary(wrapper).attributes('aria-busy')).toBe('true')
  })

  it('stays put and says what went wrong next to the button', async () => {
    signIn()
    place.mockImplementation(async () => {
      problem.value = 'network'
      return null
    })
    const { wrapper, router } = await mountView()

    await primary(wrapper).trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/checkout/e1')
    const alert = wrapper.get('[data-test="checkout-problem"]')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('No se pudo completar')
    expect(alert.text()).toContain(
      'Parece un problema de conexión. Nada se perdió: intenta de nuevo.',
    )
  })

  it('reads the cart again, and offers both ways out, when the photos are not in the cart', async () => {
    signIn()
    problem.value = 'cart-missing'
    const { wrapper } = await mountView()

    const alert = wrapper.get('[data-test="checkout-problem"]')
    expect(alert.text()).toContain('No encontramos estas fotos en tu carrito')
    expect(buttonNamed(wrapper, 'Ir a Mis fotos')?.attributes('href')).toBe('/account/orders')
    expect(alert.findAll('a').map((link) => link.attributes('href'))).toContain(
      '/gallery/mama-rumi',
    )
    await flushPromises()
    expect(refetchCart).toHaveBeenCalled()
  })

  it('reads the billing data again when the consent is missing on the server', async () => {
    signIn()
    refreshBilling.mockClear()
    problem.value = 'consent'
    await mountView()
    await flushPromises()

    expect(refreshBilling).toHaveBeenCalled()
  })

  it('takes a photo out, and keeps the price block while the total changes', async () => {
    signIn()
    const { wrapper } = await mountView()
    const block = wrapper.get('.order-summary__price').element

    await wrapper.findAll('button[aria-label="Quitar foto"]')[2]!.trigger('click')
    expect(remove).toHaveBeenCalledWith('p2')

    state.groups = [group(2)]
    await flushPromises()

    expect(wrapper.get('.order-summary__price').element).toBe(block)
    expect(wrapper.get('.order-summary__total').text()).toBe('$8,00')
    expect(primary(wrapper).text()).toBe('Confirmar pedido · $8,00')
  })

  it('puts no amount on the buttons, and no price, without tiers', async () => {
    signIn()
    state.hasTiers = false
    state.cardAvailable = true
    const { wrapper } = await mountView()

    expect(primary(wrapper).text()).toBe('Continuar al pago')
    expect(wrapper.find('.order-summary__price').exists()).toBe(false)
  })

  it('offers to keep exploring', async () => {
    const { wrapper } = await mountView()

    expect(buttonNamed(wrapper, 'Seguir explorando')?.attributes('href')).toBe('/gallery')
  })
})
