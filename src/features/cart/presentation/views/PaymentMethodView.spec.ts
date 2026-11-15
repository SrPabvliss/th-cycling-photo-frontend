import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { ICartGroup } from '@/shared/types/cart.types'
import type { CheckoutProblem } from '@/shared/utils/checkout-error'
import { useCheckoutDraftStore } from '../../stores/checkout-draft.store'
import PaymentMethodView from './PaymentMethodView.vue'

const REAL_TIERS = [
  { minQty: 1, maxQty: 2, pricePerPhoto: 4 },
  { minQty: 3, maxQty: 6, pricePerPhoto: 3 },
  { minQty: 7, maxQty: null, pricePerPhoto: 2.5 },
]

const state = reactive({
  cartStatus: 'success' as 'pending' | 'error' | 'success',
  photos: 3,
  cardAvailable: true as boolean | undefined,
  accountIds: ['b1'] as string[],
  billingLoaded: true,
  needsConsent: false,
})
const problem = ref<CheckoutProblem | null>(null)
const isPlacing = ref(false)
const place = vi.fn()

vi.mock('@/shared/cart', () => ({
  useCartState: () => ({
    status: computed(() => state.cartStatus),
    groups: computed<ICartGroup[]>(() =>
      state.photos
        ? [
            {
              eventId: 'e1',
              eventName: 'Mama Rumi 2026',
              eventSlug: 'mama-rumi',
              startDate: new Date(),
              endDate: new Date(),
              photos: Array.from({ length: state.photos }, (_, index) => ({
                id: `p${index}`,
                publicSlug: `s${index}`,
              })),
            },
          ]
        : [],
    ),
    isFetching: computed(() => false),
    refetch: vi.fn(),
  }),
}))
vi.mock('@/shared/pricing/use-pricing-tiers', () => ({
  usePricingTiersQuery: () => ({
    data: computed(() => ({ currency: 'USD', source: 'default', tiers: REAL_TIERS })),
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
    isBillingLoaded: computed(() => state.billingLoaded),
    billingAccounts: computed(() => state.accountIds.map((id) => ({ id }))),
    needsInvoiceConsent: computed(() => state.needsConsent),
  }),
}))
vi.mock('../../composables/use-place-order', () => ({
  usePlaceOrder: () => ({ place, isPlacing, problem, reset: () => (problem.value = null) }),
}))

const Stub = { render: () => null }
const mounted: { unmount(): void }[] = []

const ROUTES = () => [
  { path: '/gallery/:slug?', component: Stub },
  { path: '/account/orders', name: 'account-orders', component: Stub },
  { path: '/account/profile', name: 'account-profile', component: Stub },
  { path: '/checkout/payment', component: Stub },
  { path: '/checkout/received/:orderId', component: Stub },
  { path: '/checkout/:eventId', component: Stub },
  { path: '/checkout/:eventId/method', component: PaymentMethodView },
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

async function mountView(path = '/checkout/e1/method') {
  const router = createRouter({ history: createMemoryHistory(), routes: ROUTES() })
  await router.push(path)
  const component = mount(PaymentMethodView, {
    attachTo: document.body,
    global: { plugins: [router] },
  })
  mounted.push(component)
  await flushPromises()
  return { wrapper: new DOMWrapper(document.body), router }
}

type Wrapper = Awaited<ReturnType<typeof mountView>>['wrapper']
const option = (wrapper: Wrapper, title: string) =>
  wrapper.findAll('[role="radio"]').find((each) => each.text().includes(title))!
const card = (wrapper: Wrapper) => option(wrapper, 'Tarjeta de crédito o débito')
const transfer = (wrapper: Wrapper) => option(wrapper, 'Transferencia bancaria')
const continueButton = (wrapper: Wrapper) => wrapper.get('[data-test="method-continue"]')
const ORDER = { orderId: 'o9', eventName: 'x', photoCount: 3, subtotal: 9, currency: 'USD' }

describe('PaymentMethodView', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    setActivePinia(createPinia())
    useCheckoutDraftStore().keep('e1', { billingAccountId: 'b1', consentChecked: false })
    Object.assign(state, {
      cartStatus: 'success',
      photos: 3,
      cardAvailable: true,
      accountIds: ['b1'],
      billingLoaded: true,
      needsConsent: false,
    })
    problem.value = null
    isPlacing.value = false
    place.mockReset()
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('carries no advertising: it is a payment screen', async () => {
    const { wrapper } = await mountView()

    expect(
      wrapper
        .find('[aria-label="Espacio publicitario"], .house-spot, .season-bar, .presenter-strip')
        .exists(),
    ).toBe(false)
  })

  it('shows the total and both methods, none chosen, and keeps Continuar off', async () => {
    const { wrapper } = await mountView()

    expect(wrapper.get('h1').text()).toBe('Método de pago')
    expect(wrapper.get('.payment-method__total').text()).toContain('Total · 3 fotos')
    expect(wrapper.get('.payment-method__amount').text()).toBe('$9,00')
    expect(wrapper.get('[role="radiogroup"]').attributes('aria-label')).toBe('Método de pago')
    expect(card(wrapper).text()).toContain('Pagas ahora y descargas tus fotos de inmediato.')
    expect(transfer(wrapper).text()).toContain(
      'Te escribimos por WhatsApp con los datos para pagar. Tus fotos se liberan cuando confirmamos el pago.',
    )
    expect(card(wrapper).attributes('aria-checked')).toBe('false')
    expect(transfer(wrapper).attributes('aria-checked')).toBe('false')
    expect(continueButton(wrapper).attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Todavía no se registra nada. El pedido se crea al continuar.')
  })

  it('creates the transfer order and opens it', async () => {
    place.mockResolvedValue([ORDER])
    const { wrapper, router } = await mountView()

    await transfer(wrapper).trigger('click')
    await continueButton(wrapper).trigger('click')
    await flushPromises()

    expect(place).toHaveBeenCalledWith({
      eventId: 'e1',
      method: 'transfer',
      billingAccountId: 'b1',
      recordConsent: false,
    })
    expect(router.currentRoute.value.path).toBe('/checkout/received/o9')
  })

  it('creates the card order and goes to pay it, with the ids', async () => {
    place.mockResolvedValue([ORDER, { ...ORDER, orderId: 'o10' }])
    useCheckoutDraftStore().keep('e1', { billingAccountId: 'b1', consentChecked: true })
    const { wrapper, router } = await mountView()

    await card(wrapper).trigger('click')
    await continueButton(wrapper).trigger('click')
    await flushPromises()

    expect(place).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'card', recordConsent: true }),
    )
    expect(router.currentRoute.value.fullPath).toBe('/checkout/payment?orders=o9,o10&evento=e1')
  })

  it('moves the choice with the arrow keys, like a radio group', async () => {
    const { wrapper } = await mountView()

    await card(wrapper).trigger('click')
    await card(wrapper).trigger('keydown', { key: 'ArrowDown' })

    expect(transfer(wrapper).attributes('aria-checked')).toBe('true')
    expect(document.activeElement).toBe(transfer(wrapper).element)
    expect(transfer(wrapper).attributes('tabindex')).toBe('0')
    expect(card(wrapper).attributes('tabindex')).toBe('-1')

    await transfer(wrapper).trigger('keydown', { key: 'ArrowUp' })
    expect(card(wrapper).attributes('aria-checked')).toBe('true')
  })

  it('shows the button busy while the order is on its way', async () => {
    isPlacing.value = true
    const { wrapper } = await mountView()

    expect(continueButton(wrapper).attributes('aria-busy')).toBe('true')
    expect(continueButton(wrapper).attributes('disabled')).toBeDefined()
  })

  it('sends back to the checkout when the event takes no cards', async () => {
    state.cardAvailable = false
    const { router } = await mountView()

    expect(router.currentRoute.value.path).toBe('/checkout/e1')
  })

  it('sends back to the checkout without photos of the event', async () => {
    state.photos = 0
    const { router } = await mountView()

    expect(router.currentRoute.value.path).toBe('/checkout/e1')
  })

  it('stays with the notice when the answer was lost and the cart came back without the photos', async () => {
    const { wrapper, router } = await mountView()
    await transfer(wrapper).trigger('click')

    // The order was created anyway: its photos left the cart that is read again.
    problem.value = 'unconfirmed'
    state.photos = 0
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/checkout/e1/method')
    expect(wrapper.text()).toContain('No sabemos si tu pedido se creó')
    expect(wrapper.find('a[href="/account/orders"]').exists()).toBe(true)
    // Nothing left to pay here: no zero total, no method, no second try.
    expect(wrapper.find('[role="radiogroup"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="method-continue"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('0 fotos')
  })

  it('sends back to the checkout without a draft from the confirm screen', async () => {
    useCheckoutDraftStore().forget('e1')
    const { router } = await mountView()

    expect(router.currentRoute.value.path).toBe('/checkout/e1')
  })

  it('sends back to the checkout when the billing choice is not the buyer’s', async () => {
    state.accountIds = ['other']
    const { router } = await mountView()

    expect(router.currentRoute.value.path).toBe('/checkout/e1')
  })

  it('sends back to the checkout when the consent is owed and was not ticked', async () => {
    state.needsConsent = true
    const { router } = await mountView()

    expect(router.currentRoute.value.path).toBe('/checkout/e1')
  })

  it('never takes the billing choice or the consent from the address', async () => {
    useCheckoutDraftStore().forget('e1')
    state.needsConsent = true
    const { wrapper, router } = await mountView('/checkout/e1/method?factura=b1&consentimiento=1')

    expect(router.currentRoute.value.path).toBe('/checkout/e1')
    expect(wrapper.find('[data-test="method-continue"]').exists()).toBe(false)
    expect(place).not.toHaveBeenCalled()
  })

  it('forgets the draft once the order is created', async () => {
    place.mockResolvedValue([ORDER])
    const { wrapper } = await mountView()

    await transfer(wrapper).trigger('click')
    await continueButton(wrapper).trigger('click')
    await flushPromises()

    expect(useCheckoutDraftStore().draftFor('e1')).toBeNull()
  })

  it('keeps the draft when the order could not be created', async () => {
    place.mockResolvedValue(null)
    const { wrapper } = await mountView()

    await transfer(wrapper).trigger('click')
    await continueButton(wrapper).trigger('click')
    await flushPromises()

    expect(useCheckoutDraftStore().draftFor('e1')).not.toBeNull()
  })

  it('keeps the draft going back to the confirm screen, and forgets it leaving the purchase', async () => {
    const router = await mountOutlet('/checkout/e1/method')
    await router.push('/checkout/e1')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/checkout/e1')
    expect(useCheckoutDraftStore().draftFor('e1')).not.toBeNull()

    await router.push('/checkout/e1/method')
    await flushPromises()
    await router.push('/gallery')
    await flushPromises()
    expect(useCheckoutDraftStore().draftFor('e1')).toBeNull()
  })

  it('waits for the data before deciding anything', async () => {
    state.cartStatus = 'pending'
    state.cardAvailable = undefined
    state.billingLoaded = false
    state.accountIds = []
    const { router } = await mountView()

    expect(router.currentRoute.value.path).toBe('/checkout/e1/method')
  })

  it('turns card off and picks transfer when cards stopped being available', async () => {
    place.mockImplementation(async () => {
      problem.value = 'card-unavailable'
      return null
    })
    const { wrapper, router } = await mountView()

    await card(wrapper).trigger('click')
    await continueButton(wrapper).trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/checkout/e1/method')
    expect(wrapper.get('[data-test="checkout-problem"]').text()).toContain(
      'El pago con tarjeta no está disponible',
    )
    expect(card(wrapper).attributes('aria-disabled')).toBe('true')
    expect(transfer(wrapper).attributes('aria-checked')).toBe('true')
    expect(continueButton(wrapper).attributes('disabled')).toBeUndefined()
  })
})
