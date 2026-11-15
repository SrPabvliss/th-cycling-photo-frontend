import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import type { ICartGroup } from '@/shared/types/cart.types'
import type { CheckoutProblem } from '@/shared/utils/checkout-error'
import { useCheckoutDraftStore } from '../../stores/checkout-draft.store'
vi.mock('@/features/house-spots/presentation/components/HouseSpot/HouseSpot.vue', async () => ({
  default: (await import('@/features/house-spots/testing/spot-stubs')).HouseSpotStub,
}))

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
  optionsFailed: false,
  optionsRetrying: false,
  accounts: [ACCOUNT] as (typeof ACCOUNT)[],
  needsConsent: false,
  billingFailed: false,
})
const retryBilling = vi.fn()
const consentChecked = ref(false)
const problem = ref<CheckoutProblem | null>(null)
const isPlacing = ref(false)
const place = vi.fn()
const remove = vi.fn()
const refetchCart = vi.fn()
const refreshBilling = vi.fn()
const refetchOptions = vi.fn()

vi.mock('@/shared/cart', () => ({
  useCartState: () => ({
    status: computed(() => state.cartStatus),
    groups: computed(() => state.groups),
    isFetching: computed(() => false),
    error: computed(() => null),
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
      state.optionsFailed || state.cardAvailable === undefined
        ? undefined
        : { cardAvailable: state.cardAvailable },
    ),
    status: computed(() =>
      state.optionsFailed ? 'error' : state.cardAvailable === undefined ? 'pending' : 'success',
    ),
    error: computed(() => (state.optionsFailed ? new Error('network') : null)),
    isLoading: computed(() => !state.optionsFailed && state.cardAvailable === undefined),
    isFetching: computed(() => state.optionsRetrying),
    refetch: refetchOptions,
  }),
}))
vi.mock('@/features/account/composables/use-billing-selection', () => ({
  useBillingSelection: () => ({
    isBillingLoaded: computed(() => !state.billingFailed),
    billingProblem: computed(() => state.billingFailed),
    isBillingRetrying: ref(false),
    retryBilling,
    billingAccounts: computed(() => (state.billingFailed ? [] : state.accounts)),
    needsInvoiceConsent: computed(() => state.needsConsent),
    selectedBillingAccountId: computed(() => state.accounts[0]?.id ?? null),
    invoiceConsentChecked: consentChecked,
    billingSheet: ref(null),
    billingPrefill: computed(() => ({ legalName: '', email: '' })),
    isBillingReady: computed(
      () =>
        !state.billingFailed &&
        state.accounts.length > 0 &&
        (!state.needsConsent || consentChecked.value),
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

const ROUTES = () => [
  { path: '/gallery', component: Stub },
  { path: '/gallery/:slug', component: Stub },
  { path: '/login', component: Stub },
  { path: '/account/orders', name: 'account-orders', component: Stub },
  { path: '/account/profile', name: 'account-profile', component: Stub },
  { path: '/checkout/:eventId', component: CheckoutView },
  { path: '/checkout/:eventId/method', component: Stub },
  { path: '/checkout/received/:orderId', component: Stub },
]

/** Mounts the app's router outlet, so screens leave by navigation as they do in the app. */
async function mountOutlet(path: string) {
  const router = createRouter({ history: createMemoryHistory(), routes: ROUTES() })
  await router.push(path)
  mounted.push(
    mount(
      { template: '<RouterView />' },
      { attachTo: document.body, global: { plugins: [router] } },
    ),
  )
  await flushPromises()
  return router
}

async function mountView() {
  const router = createRouter({ history: createMemoryHistory(), routes: ROUTES() })
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
      billingFailed: false,
      optionsFailed: false,
      optionsRetrying: false,
    })
    retryBilling.mockClear()
    refetchOptions.mockClear()
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

  it('says the session expired, not that the order has no photos, and comes back here after signing in', async () => {
    state.groups = []
    useSessionStore().expireSession()
    const { wrapper } = await mountView()

    expect(wrapper.text()).toContain('Tu sesión se cerró')
    expect(wrapper.text()).not.toContain('No hay fotos en este pedido')
    expect(buttonNamed(wrapper, 'Iniciar sesión')?.attributes('href')).toBe(
      '/login?redirect=/checkout/e1',
    )
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

    expect(wrapper.text()).toContain('No pudimos mostrar tu carrito')
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

  describe('the house strip', () => {
    afterEach(() => {
      Reflect.deleteProperty(window, 'matchMedia')
    })

    function setWide() {
      window.matchMedia = vi.fn((query: string) => ({
        matches: query.includes('min-width'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        onchange: null,
        dispatchEvent: vi.fn(),
      })) as unknown as typeof window.matchMedia
    }

    it('goes under the buttons on a phone', async () => {
      signIn()
      const { wrapper } = await mountView()

      const ad = wrapper.get('[data-test="house-spot"]')
      expect(ad.attributes('data-format')).toBe('D')
      expect(ad.attributes('data-seed')).toBe('31')
      expect(ad.element.previousElementSibling?.classList.contains('checkout__actions')).toBe(true)
      expect(wrapper.findAll('[data-test="house-spot"]')).toHaveLength(1)
    })

    it('goes under the summary from 768 px', async () => {
      setWide()
      signIn()
      const { wrapper } = await mountView()

      const ad = wrapper.get('[data-test="house-spot"]')
      expect(ad.element.parentElement?.classList.contains('checkout__main')).toBe(true)
      expect(wrapper.findAll('[data-test="house-spot"]')).toHaveLength(1)
    })

    it('is not there without a session or without photos', async () => {
      const guest = await mountView()
      expect(guest.wrapper.find('[data-test="house-spot"]').exists()).toBe(false)
      while (mounted.length) mounted.pop()!.unmount()

      signIn()
      state.groups = []
      const empty = await mountView()
      expect(empty.wrapper.find('[data-test="house-spot"]').exists()).toBe(false)
    })
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

  it('says the billing data could not load, in place of the card, instead of asking to add some', async () => {
    signIn()
    state.billingFailed = true
    const { wrapper } = await mountView()

    const alert = wrapper.get('[data-test="billing-problem"]')
    expect(alert.classes()).toContain('form-alert')
    expect(alert.text()).toContain('No pudimos mostrar tus datos de factura')
    expect(alert.text()).toContain('Los necesitamos para crear tu pedido.')
    expect(wrapper.find('[data-test="billing-add"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Agrega tus datos de facturación para confirmar.')
    expect(primary(wrapper).attributes('disabled')).toBeDefined()

    await alert.get('button').trigger('click')
    expect(retryBilling).toHaveBeenCalledTimes(1)
  })

  describe('when the ways to pay could not be read', () => {
    it('never confirms: it says so, with a retry, and keeps the button off', async () => {
      signIn()
      state.optionsFailed = true
      const { wrapper } = await mountView()

      const alert = wrapper.get('[data-test="payment-options-problem"]')
      expect(alert.classes()).toContain('form-alert--warn')
      expect(alert.text()).toContain('No pudimos mostrar las formas de pago')
      expect(alert.text()).toContain('Las necesitamos para crear tu pedido.')
      expect(primary(wrapper).attributes('disabled')).toBeDefined()
      expect(primary(wrapper).text()).not.toContain('Confirmar pedido')
      expect(wrapper.text()).not.toContain('Este evento se paga por transferencia.')

      await primary(wrapper).trigger('click')
      await flushPromises()
      expect(place).not.toHaveBeenCalled()

      await alert.get('button').trigger('click')
      expect(refetchOptions).toHaveBeenCalledTimes(1)
    })

    it('goes on as usual once the retry brings them', async () => {
      signIn()
      state.optionsFailed = true
      const { wrapper } = await mountView()

      state.optionsFailed = false
      state.cardAvailable = true
      await flushPromises()

      expect(wrapper.find('[data-test="payment-options-problem"]').exists()).toBe(false)
      expect(primary(wrapper).text()).toBe('Continuar al pago · $9,00')
      expect(primary(wrapper).attributes('disabled')).toBeUndefined()
    })
  })

  it('does not say how the order is paid before knowing it', async () => {
    signIn()
    state.cardAvailable = undefined
    const { wrapper } = await mountView()

    expect(primary(wrapper).text()).toBe('Continuar · $9,00')
    expect(primary(wrapper).attributes('disabled')).toBeDefined()
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
    expect(router.currentRoute.value.query).toEqual({})
    expect(useCheckoutDraftStore().draftFor('e1')).toEqual({
      billingAccountId: 'b1',
      consentChecked: false,
    })
    expect(place).not.toHaveBeenCalled()
  })

  it('carries the ticked consent to the payment method screen', async () => {
    signIn()
    state.cardAvailable = true
    state.needsConsent = true
    consentChecked.value = true
    const { wrapper, router } = await mountView()

    await primary(wrapper).trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({})
    expect(useCheckoutDraftStore().draftFor('e1')).toEqual({
      billingAccountId: 'b1',
      consentChecked: true,
    })
  })

  it('keeps the draft for the method screen, and forgets it leaving the purchase', async () => {
    signIn()
    const drafts = useCheckoutDraftStore()
    drafts.keep('e1', { billingAccountId: 'b1', consentChecked: true })

    const router = await mountOutlet('/checkout/e1')
    await router.push('/checkout/e1/method')
    await flushPromises()
    expect(drafts.draftFor('e1')).not.toBeNull()

    await router.push('/checkout/e1')
    await flushPromises()
    await router.push('/gallery')
    await flushPromises()
    expect(drafts.draftFor('e1')).toBeNull()
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
    expect(alert.classes()).toContain('form-alert')
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

  describe('photos already bought', () => {
    function withBought(...ids: string[]): ICartGroup {
      const base = group(3)
      return {
        ...base,
        photos: base.photos.map((photo) => ({
          ...photo,
          alreadyPurchased: ids.includes(photo.id),
        })),
      }
    }

    it('marks them, says so next to the button with the way to Mis fotos, and keeps it off', async () => {
      signIn()
      state.groups = [withBought('p1')]
      const { wrapper } = await mountView()

      const marks = wrapper.findAll('.order-summary__bought')
      expect(marks.map((mark) => mark.text())).toEqual(['Ya la compraste'])
      const alert = wrapper.get('[data-test="already-bought"]')
      expect(alert.classes()).toContain('form-alert--bad')
      expect(alert.text()).toContain('Ya compraste alguna de estas fotos')
      expect(alert.text()).toContain(
        'Quita las marcadas para confirmar. Las encuentras en Mis fotos.',
      )
      expect(alert.find('a').attributes('href')).toBe('/account/orders')
      expect(primary(wrapper).attributes('disabled')).toBeDefined()

      await primary(wrapper).trigger('click')
      await flushPromises()
      expect(place).not.toHaveBeenCalled()
    })

    it('lets the order go on once they are taken out', async () => {
      signIn()
      state.groups = [withBought('p1')]
      const { wrapper } = await mountView()

      state.groups = [group(2)]
      await flushPromises()

      expect(wrapper.find('[data-test="already-bought"]').exists()).toBe(false)
      expect(primary(wrapper).attributes('disabled')).toBeUndefined()
    })

    it('reads the cart again when the server turns the order down for one, and says it once', async () => {
      signIn()
      state.groups = [withBought('p1')]
      problem.value = 'already-purchased'
      const { wrapper } = await mountView()
      await flushPromises()

      expect(refetchCart).toHaveBeenCalled()
      expect(
        wrapper.findAll('.form-alert').filter((alert) => alert.text().includes('Ya compraste')),
      ).toHaveLength(1)
    })
  })

  it('keeps the photos of an event out of sale in the cart, to take them out, and says why', async () => {
    signIn()
    problem.value = 'event-unavailable'
    const { wrapper } = await mountView()
    await flushPromises()

    const alert = wrapper.get('[data-test="checkout-problem"]')
    expect(alert.classes()).toContain('form-alert--bad')
    expect(alert.text()).toContain('Las fotos de este evento no están disponibles para la compra')
    expect(wrapper.findAll('.order-summary__thumb')).toHaveLength(3)
    expect(refetchCart).not.toHaveBeenCalled()
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
