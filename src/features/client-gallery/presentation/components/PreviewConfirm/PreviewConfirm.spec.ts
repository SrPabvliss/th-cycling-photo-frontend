import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { usePhotoSelection } from '../../../composables/use-photo-selection'
import type { IPreviewData } from '../../../types/responses/preview-data.response'
import type { PreviewProblem } from '../../../utils/preview-problem'
import PreviewConfirm from './PreviewConfirm.vue'

const state = reactive({
  billingReady: true,
  hasAccount: true,
  cardAvailable: false,
  billingFailed: false,
})
const retryBilling = vi.fn()
const place = vi.fn()
const problem = ref<PreviewProblem | null>(null)

vi.mock('@/features/account/composables/use-billing-selection', () => ({
  useBillingSelection: () => ({
    isBillingLoaded: computed(() => !state.billingFailed),
    billingProblem: computed(() => state.billingFailed),
    isBillingRetrying: ref(false),
    retryBilling,
    billingAccounts: computed(() =>
      state.hasAccount && !state.billingFailed
        ? [
            {
              id: 'b1',
              idType: 'national_id',
              idNumber: '1710034065',
              legalName: 'Ana',
              email: 'a@b.c',
              address: null,
              isDefault: true,
            },
          ]
        : [],
    ),
    needsInvoiceConsent: computed(() => false),
    selectedBillingAccountId: computed(() => (state.hasAccount ? 'b1' : null)),
    invoiceConsentChecked: ref(false),
    billingSheet: ref(null),
    billingPrefill: computed(() => ({ legalName: '', email: '' })),
    isBillingReady: computed(() => state.billingReady && state.hasAccount && !state.billingFailed),
    isSettingDefault: ref(false),
    handleBillingSaved: vi.fn(),
    handleBillingChosen: vi.fn(),
    refreshBilling: vi.fn(),
  }),
}))
vi.mock('@/shared/composables/use-event-payment-options', () => ({
  useEventPaymentOptionsQuery: () => ({
    data: computed(() => ({ cardAvailable: state.cardAvailable })),
    isLoading: computed(() => false),
  }),
}))
vi.mock('../../../composables/use-place-preview-order', () => ({
  usePlacePreviewOrder: () => ({
    place,
    isPlacing: ref(false),
    problem,
    reset: () => (problem.value = null),
  }),
}))
vi.mock('@/shared/pricing/use-pricing-tiers', () => ({
  usePricingTiersQuery: () => ({
    data: computed(() => ({
      currency: 'USD',
      source: 'default',
      tiers: [
        { minQty: 1, maxQty: 2, pricePerPhoto: 4 },
        { minQty: 3, maxQty: null, pricePerPhoto: 3 },
      ],
    })),
  }),
}))

const PREVIEW: IPreviewData = {
  token: 'tok',
  eventId: 'e1',
  eventTypeId: 1,
  organizerName: 'Titan Racing',
  eventName: 'Mama Rumi 2026',
  startDate: new Date(2026, 9, 4),
  endDate: new Date(2026, 9, 5),
  status: 'active',
  expiresAt: new Date(2026, 11, 1),
  photos: [
    { id: 'a', url: 'u/a' },
    { id: 'b', url: 'u/b' },
    { id: 'c', url: 'u/c' },
  ],
}

const mounted: { unmount(): void }[] = []
async function mountConfirm() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:any(.*)*', component: { render: () => null } }],
  })
  await router.push('/preview/tok')
  const selection = usePhotoSelection(ref('tok'), ref(['a', 'b', 'c']))
  ;['a', 'b', 'c'].forEach((id) => selection.toggle(id))
  const component = mount(PreviewConfirm, {
    attachTo: document.body,
    props: { preview: PREVIEW, selection },
    global: { plugins: [router] },
  })
  mounted.push(component)
  await flushPromises()
  return { wrapper: new DOMWrapper(document.body), component, router, selection }
}
const confirmButton = (wrapper: DOMWrapper<Element>) => wrapper.get('[data-test="preview-confirm"]')

describe('PreviewConfirm', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    sessionStorage.clear()
    setActivePinia(createPinia())
    Object.assign(state, {
      billingReady: true,
      hasAccount: true,
      cardAvailable: false,
      billingFailed: false,
    })
    retryBilling.mockClear()
    place.mockReset()
    problem.value = null
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('sums up the chosen photos and their total', async () => {
    const { wrapper } = await mountConfirm()

    expect(wrapper.get('h1').text()).toBe('Confirmar pedido')
    expect(wrapper.text()).toContain('Mama Rumi 2026')
    expect(wrapper.findAll('.preview-confirm__thumb')).toHaveLength(3)
    expect(confirmButton(wrapper).text()).toBe('Confirmar pedido · $9,00')
    expect(wrapper.text()).toContain(
      'Se paga por transferencia. Al confirmar, te escribimos por WhatsApp con el total y los datos para pagar.',
    )
  })

  it('keeps the button off without billing data', async () => {
    state.hasAccount = false
    const { wrapper } = await mountConfirm()

    expect(confirmButton(wrapper).attributes('disabled')).toBeDefined()
  })

  it('says the billing data could not load, in place of the card, and offers to retry', async () => {
    state.billingFailed = true
    const { wrapper } = await mountConfirm()

    const alert = wrapper.get('[data-test="billing-problem"]')
    expect(alert.text()).toContain('No pudimos mostrar tus datos de factura')
    expect(wrapper.find('[data-test="billing-add"]').exists()).toBe(false)
    expect(confirmButton(wrapper).attributes('disabled')).toBeDefined()

    await alert.get('button').trigger('click')
    expect(retryBilling).toHaveBeenCalledTimes(1)
  })

  it('keeps the button off until a method is chosen, when cards are taken', async () => {
    state.cardAvailable = true
    const { wrapper } = await mountConfirm()

    expect(wrapper.get('[role="radiogroup"]').attributes('aria-label')).toBe('Método de pago')
    expect(wrapper.findAll('[role="radio"][aria-checked="true"]')).toHaveLength(0)
    expect(confirmButton(wrapper).attributes('disabled')).toBeDefined()

    await wrapper.findAll('[role="radio"]')[1]!.trigger('click')
    expect(confirmButton(wrapper).attributes('disabled')).toBeUndefined()
  })

  it('orders by transfer, forgets the chosen photos and opens the received order', async () => {
    place.mockResolvedValue({
      id: 'o9',
      subtotal: 9,
      currency: 'USD',
      photoCount: 3,
      method: 'transfer',
    })
    const { wrapper, router, selection } = await mountConfirm()

    await confirmButton(wrapper).trigger('click')
    await flushPromises()

    expect(place).toHaveBeenCalledWith({
      photoIds: ['a', 'b', 'c'],
      billingAccountId: 'b1',
      method: 'transfer',
      recordConsent: false,
    })
    expect(router.currentRoute.value.path).toBe('/checkout/received/o9')
    expect(selection.selected.value).toEqual([])
    expect(Object.keys(sessionStorage)).toHaveLength(0)
  })

  it('goes to pay by card with the order and the event', async () => {
    state.cardAvailable = true
    place.mockResolvedValue({
      id: 'o9',
      subtotal: 9,
      currency: 'USD',
      photoCount: 3,
      method: 'card',
    })
    const { wrapper, router } = await mountConfirm()

    await wrapper.findAll('[role="radio"]')[0]!.trigger('click')
    await confirmButton(wrapper).trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/checkout/payment?orders=o9&evento=e1')
  })

  it('turns cards off and picks transfer when cards stopped being available', async () => {
    state.cardAvailable = true
    place.mockImplementation(async () => {
      problem.value = 'card-unavailable'
      return null
    })
    const { wrapper } = await mountConfirm()

    await wrapper.findAll('[role="radio"]')[0]!.trigger('click')
    await confirmButton(wrapper).trigger('click')
    await flushPromises()

    expect(wrapper.findAll('[role="radio"]')[0]!.attributes('aria-disabled')).toBe('true')
    expect(wrapper.findAll('[role="radio"]')[1]!.attributes('aria-checked')).toBe('true')
  })

  it.each<[PreviewProblem, string]>([
    ['already-ordered', 'linkProblem'],
    ['expired', 'linkProblem'],
    ['not-available', 'linkProblem'],
    ['photos-changed', 'photosChanged'],
  ])('hands %s to the page', async (kind, event) => {
    place.mockImplementation(async () => {
      problem.value = kind
      return null
    })
    const { wrapper, component } = await mountConfirm()

    await confirmButton(wrapper).trigger('click')
    await flushPromises()

    expect(component.emitted(event)).toBeTruthy()
  })

  it('goes back keeping the chosen photos', async () => {
    const { wrapper, component, selection } = await mountConfirm()

    await wrapper.get('button[aria-label="Volver a elegir fotos"]').trigger('click')

    expect(component.emitted('back')).toHaveLength(1)
    expect(selection.selected.value).toEqual(['a', 'b', 'c'])
  })
})
