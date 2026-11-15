import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { AxiosError, type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

const online = ref(true)
vi.mock('@/core/network/use-online', () => ({ useOnline: () => online }))

import type { IMyOrderInvoice } from '../../types/responses/my-order-invoice.response'
import type { IMyOrderDetail, MyOrderState } from '../../types/responses/my-order.response'
vi.mock('@/features/house-spots/presentation/components/HouseSpot/HouseSpot.vue', async () => ({
  default: (await import('@/features/house-spots/testing/spot-stubs')).HouseSpotStub,
}))

import MyOrderDetailView from './MyOrderDetailView.vue'

const state = reactive({
  status: 'success' as 'pending' | 'error' | 'success',
  order: undefined as IMyOrderDetail | undefined,
  error: null as unknown,
})
const refetch = vi.fn()
const cancel = vi.fn()
const success = vi.fn()
const error = vi.fn()

vi.mock('../../composables/queries/use-my-order-detail', () => ({
  useMyOrderDetailQuery: () => ({
    status: computed(() => state.status),
    data: computed(() => state.order),
    error: computed(() => state.error),
    isFetching: ref(false),
    refetch,
  }),
}))
vi.mock('../../composables/queries/use-my-phones', () => ({
  useMyPhonesQuery: () => ({
    data: computed(() => [
      { id: 'x', phoneNumber: '+593991234567', label: null, isWhatsapp: true, isPrimary: true },
    ]),
  }),
}))
vi.mock('../../composables/mutations/use-cancel-my-order', () => ({
  useCancelMyOrder: () => ({ mutateAsync: cancel, isPending: ref(false) }),
}))
vi.mock('../../composables/mutations/use-download-my-tax-document', () => ({
  useDownloadMyTaxDocument: () => ({
    mutate: vi.fn(),
    isPending: ref(false),
    variables: ref(undefined),
  }),
}))
vi.mock('../../composables/mutations/use-correct-my-order-billing', () => ({
  useCorrectMyOrderBilling: () => ({
    mutate: vi.fn(),
    isPending: ref(false),
    error: ref(null),
    reset: vi.fn(),
  }),
}))
vi.mock('naive-ui', async (original) => ({
  ...(await original<typeof import('naive-ui')>()),
  useMessage: () => ({ success, error, info: vi.fn() }),
}))

const MINUTE = 60_000
const order = (
  orderState: MyOrderState,
  overrides: Partial<IMyOrderDetail> = {},
): IMyOrderDetail => ({
  id: '3f2a9c1b-0000-4000-8000-000000000000',
  state: orderState,
  eventName: 'Mama Rumi 2026',
  createdAt: new Date(Date.now() - 5 * MINUTE).toISOString(),
  subtotal: '9.00',
  currency: 'USD',
  canDownload: orderState === 'ready' || orderState === 'gifted',
  canCancel: orderState === 'in_process',
  photos: [
    { id: 'p1', galleryUrl: 'g1' },
    { id: 'p2', galleryUrl: 'g2' },
    { id: 'p3', galleryUrl: 'g3' },
  ],
  invoice: null,
  billing: {
    idType: 'national_id',
    idNumber: '1710034065',
    legalName: 'Juan Pérez',
    email: 'j@c.com',
    address: null,
  },
  confirmingTransactionId: orderState === 'confirming' ? 'tx-1' : null,
  ...overrides,
})
const invoice = (invoiceState: IMyOrderInvoice['state'], canCorrect = false): IMyOrderInvoice => ({
  state: invoiceState,
  rejectionMessages: [],
  canCorrect,
  documents: [
    {
      id: 'd1',
      type: 'invoice',
      state: 'authorized',
      number: '001-002-000000123',
      issueDate: '2026-11-12',
      downloadable: true,
      current: true,
    },
  ],
})
function notFound() {
  const response = { status: 404, data: {}, headers: {}, config: {} } as AxiosResponse
  return new AxiosError('nf', 'ERR_BAD_REQUEST', undefined, undefined, response)
}

const mounted: { unmount(): void }[] = []
async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/account/orders/:id', component: MyOrderDetailView },
      { path: '/:any(.*)*', component: { render: () => null } },
    ],
  })
  await router.push('/account/orders/3f2a9c1b-0000-4000-8000-000000000000')
  mounted.push(
    mount(
      { template: '<RouterView />' },
      {
        attachTo: document.body,
        global: {
          plugins: [router],
          stubs: { OrderPhotoGrid: { template: '<div data-test="photos" />' } },
        },
      },
    ),
  )
  await flushPromises()
  return new DOMWrapper(document.body)
}
const button = (wrapper: DOMWrapper<Element>, name: string) =>
  wrapper.findAll('button, a').find((each) => each.text().replace(/\s+/g, ' ').trim() === name)

describe('MyOrderDetailView', () => {
  beforeEach(() => {
    online.value = true
    document.body.innerHTML = ''
    setActivePinia(createPinia())
    Object.assign(state, { status: 'success', order: order('ready'), error: null })
    for (const mock of [refetch, cancel, success, error]) mock.mockReset()
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
    vi.useRealTimers()
  })

  it('heads the order with its event, state, code and date', async () => {
    const wrapper = await mountView()

    expect(wrapper.get('h1').text()).toBe('Mama Rumi 2026')
    expect(wrapper.text()).toContain('Lista para descargar')
    expect(wrapper.text()).toContain('3F2A9C1B · ')
    expect(wrapper.text()).toContain('3 fotos')
    expect(wrapper.text()).toContain('$9,00')
  })

  it.each<[MyOrderState, string, string]>([
    [
      'in_process',
      'Esperando el pago',
      'Te escribimos por WhatsApp al •••• 4567 con el total y los datos para pagar. Liberamos tus fotos cuando confirmamos el pago.',
    ],
    [
      'confirming',
      'Estamos confirmando tu pago',
      'El banco todavía no responde. No tienes que pagar de nuevo: te avisamos por correo cuando tus fotos estén listas.',
    ],
    [
      'cancelled',
      'Pedido cancelado',
      'No se cobró nada. Las fotos siguen disponibles en la galería del evento.',
    ],
    ['gifted', 'Te las regaló el organizador', 'Descárgalas las veces que quieras.'],
  ])('explains the state %s', async (orderState, title, text) => {
    state.order = order(orderState)
    const wrapper = await mountView()

    expect(wrapper.text()).toContain(title)
    expect(wrapper.text().replace(/\s+/g, ' ')).toContain(text)
  })

  it('offers no download and no cancel while confirming', async () => {
    state.order = order('confirming')
    const wrapper = await mountView()

    expect(wrapper.find('[data-test="photos"]').exists()).toBe(true)
    expect(button(wrapper, 'Cancelar pedido')).toBeUndefined()
  })

  it('adds the long-wait line only after 30 minutes confirming', async () => {
    state.order = order('confirming')
    const before = await mountView()
    expect(before.text()).not.toContain('Está tardando más de lo normal.')
    while (mounted.length) mounted.pop()!.unmount()

    state.order = order('confirming', {
      createdAt: new Date(Date.now() - 31 * MINUTE).toISOString(),
    })
    const after = await mountView()
    expect(after.text()).toContain(
      'Está tardando más de lo normal. Si ya pasó una hora, escríbenos a info@titantv.com.ec con el número de tu pedido.',
    )
  })

  it('says the payment did not go through when a confirming order disappears', async () => {
    state.order = order('confirming')
    const wrapper = await mountView()

    Object.assign(state, { status: 'error', error: notFound() })
    await flushPromises()

    expect(wrapper.text()).toContain('El pago no se completó')
    expect(wrapper.text()).toContain('No se hizo ningún cargo. Tus fotos siguen en el carrito.')
    expect(button(wrapper, 'Ver mi carrito')).toBeDefined()
    expect(wrapper.text()).not.toContain('No encontramos este pedido')
  })

  it('without network, says the order waits for it instead of a skeleton that never ends', async () => {
    online.value = false
    Object.assign(state, { status: 'pending', order: undefined })
    const wrapper = await mountView()
    await new Promise((resolve) => setTimeout(resolve, 450))

    expect(wrapper.text()).toContain('Sin conexión a internet')
    expect(wrapper.text()).toContain('Tu pedido aparecerá cuando vuelvas a tener conexión.')
    expect(wrapper.find('.order-detail__skeleton').exists()).toBe(false)
    online.value = true
  })

  it('says the order is not there when it is missing from the start', async () => {
    Object.assign(state, { status: 'error', order: undefined, error: notFound() })
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('No encontramos este pedido')
    expect(wrapper.text()).toContain('Puede que sea de otra cuenta.')
  })

  it('says once that the payment was confirmed', async () => {
    state.order = order('confirming')
    await mountView()

    state.order = order('ready')
    await flushPromises()
    state.order = { ...order('ready') }
    await flushPromises()

    expect(success).toHaveBeenCalledTimes(1)
    expect(success).toHaveBeenCalledWith('Pago confirmado. Tus fotos están listas.')
  })

  it('asks again every 10 seconds while confirming', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    state.order = order('confirming')
    await mountView()

    await vi.advanceTimersByTimeAsync(10_000)
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  describe('while the transfer waits for the payment', () => {
    function setVisibility(state: 'visible' | 'hidden') {
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: state })
      document.dispatchEvent(new Event('visibilitychange'))
    }
    afterEach(() => setVisibility('visible'))

    it('asks again every minute while the page is in view', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      state.order = order('in_process')
      await mountView()

      await vi.advanceTimersByTimeAsync(59_000)
      expect(refetch).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(1_000)
      expect(refetch).toHaveBeenCalledTimes(1)

      setVisibility('hidden')
      await vi.advanceTimersByTimeAsync(120_000)
      expect(refetch).toHaveBeenCalledTimes(1)
    })

    it('asks again as soon as the person comes back to the page', async () => {
      state.order = order('in_process')
      await mountView()

      setVisibility('hidden')
      await flushPromises()
      setVisibility('visible')
      await flushPromises()

      expect(refetch).toHaveBeenCalledTimes(1)
    })

    it('says once that the payment was confirmed, when the staff confirms it', async () => {
      state.order = order('in_process')
      await mountView()

      state.order = order('ready')
      await flushPromises()

      expect(success).toHaveBeenCalledTimes(1)
      expect(success).toHaveBeenCalledWith('Pago confirmado. Tus fotos están listas.')
    })

    it('stops asking once the order is ready', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      state.order = order('ready')
      await mountView()

      await vi.advanceTimersByTimeAsync(120_000)
      setVisibility('hidden')
      setVisibility('visible')
      await flushPromises()

      expect(refetch).not.toHaveBeenCalled()
    })
  })

  it('asks before cancelling, and keeping does not call the api', async () => {
    state.order = order('in_process')
    const wrapper = await mountView()

    await button(wrapper, 'Cancelar pedido')!.trigger('click')
    expect(wrapper.text()).toContain('¿Cancelar este pedido?')
    expect(wrapper.text()).toContain(
      'No se cobra nada. Las fotos vuelven a estar disponibles en la galería.',
    )
    await button(wrapper, 'Conservar pedido')!.trigger('click')

    expect(cancel).not.toHaveBeenCalled()
  })

  it('cancels once, even when confirmed twice, and says so', async () => {
    state.order = order('in_process')
    cancel.mockResolvedValue(undefined)
    const wrapper = await mountView()

    await button(wrapper, 'Cancelar pedido')!.trigger('click')
    await button(wrapper, 'Sí, cancelar pedido')!.trigger('click')
    await button(wrapper, 'Sí, cancelar pedido')?.trigger('click')
    await flushPromises()

    expect(cancel).toHaveBeenCalledTimes(1)
    expect(success).toHaveBeenCalledWith('Pedido cancelado.')
  })

  it('says in the dialog it can no longer be cancelled when the api refuses, and reads it again', async () => {
    state.order = order('in_process')
    const response = { status: 422, data: {}, headers: {}, config: {} } as AxiosResponse
    cancel.mockRejectedValue(new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, response))
    const wrapper = await mountView()

    await button(wrapper, 'Cancelar pedido')!.trigger('click')
    await button(wrapper, 'Sí, cancelar pedido')!.trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alertdialog"] .form-alert')
    expect(alert.text()).toContain('Este pedido ya no se puede cancelar.')
    expect(error).not.toHaveBeenCalled()
    expect(refetch).toHaveBeenCalled()
  })

  it('says a payment is on its way when that is why it cannot be cancelled yet', async () => {
    state.order = order('in_process')
    const response = {
      status: 422,
      data: {
        error: { code: 'BUSINESS_RULE', messageKey: 'order.payment_in_progress', message: 'x' },
      },
      headers: {},
      config: {},
    } as AxiosResponse
    cancel.mockRejectedValue(new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, response))
    const wrapper = await mountView()

    await button(wrapper, 'Cancelar pedido')!.trigger('click')
    await button(wrapper, 'Sí, cancelar pedido')!.trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alertdialog"] .form-alert')
    expect(alert.text()).toContain(
      'Hay un pago en curso para este pedido. Espera unos minutos e inténtalo de nuevo.',
    )
    expect(alert.text()).not.toContain('ya no se puede cancelar')
  })

  it('says a lost connection in the dialog, not that the order cannot be cancelled', async () => {
    state.order = order('in_process')
    cancel.mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'))
    const wrapper = await mountView()

    await button(wrapper, 'Cancelar pedido')!.trigger('click')
    await button(wrapper, 'Sí, cancelar pedido')!.trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alertdialog"] .form-alert')
    expect(alert.text()).toContain(
      'Parece un problema de conexión. Nada se perdió: intenta de nuevo.',
    )
    expect(alert.text()).not.toContain('ya no se puede cancelar')
    expect(error).not.toHaveBeenCalled()
  })

  it('closes a ready order with the house carousel, after its invoice', async () => {
    state.order = order('ready', { invoice: invoice('authorized') })
    const wrapper = await mountView()

    const ad = wrapper.get('[data-test="house-spot"]')
    expect(ad.attributes('data-format')).toBe('AB')
    expect(ad.attributes('data-seed')).toBe('47')
    expect(ad.element.previousElementSibling?.classList.contains('invoice-block')).toBe(true)
  })

  it('shows the carousel on a gift, and on no order that is not ready', async () => {
    state.order = order('gifted')
    expect((await mountView()).find('[data-test="house-spot"]').exists()).toBe(true)

    for (const each of ['in_process', 'confirming', 'cancelled'] as const) {
      while (mounted.length) mounted.pop()!.unmount()
      state.order = order(each)
      expect((await mountView()).find('[data-test="house-spot"]').exists(), each).toBe(false)
    }
  })

  it('offers to correct a rejected invoice', async () => {
    state.order = order('ready', { invoice: invoice('rejected', true) })
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('No se pudo emitir la factura')
    expect(button(wrapper, 'Corregir datos')).toBeDefined()
  })

  it('offers the authorized invoice as PDF and XML', async () => {
    state.order = order('ready', { invoice: invoice('authorized') })
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Juan Pérez')
    expect(wrapper.text()).toContain('001-002-000000123')
    expect(button(wrapper, 'PDF')).toBeDefined()
    expect(button(wrapper, 'XML')).toBeDefined()
  })

  it('leads a cancelled order back to the gallery of its event', async () => {
    state.order = order('cancelled', { eventSlug: 'mama-rumi-2026' })
    const wrapper = await mountView()

    expect(button(wrapper, 'Ir a la galería del evento')?.attributes('href')).toBe(
      '/gallery/mama-rumi-2026',
    )
  })

  it('offers no way to the event when the api does not say which one', async () => {
    state.order = order('cancelled', { eventSlug: null })
    const wrapper = await mountView()

    expect(button(wrapper, 'Ir a la galería del evento')).toBeUndefined()
  })

  it.each([
    ['card', '3 fotos · Tarjeta'],
    ['transfer', '3 fotos · Transferencia'],
    [null, '3 fotos'],
    [undefined, '3 fotos'],
  ] as const)('names the payment method %s when the api gives it', async (method, line) => {
    state.order = order('ready', { paymentMethod: method })
    const wrapper = await mountView()

    expect(wrapper.get('.order-detail__muted').text()).toBe(line)
  })

  it('does not name the payment method of a gift', async () => {
    state.order = order('gifted', { paymentMethod: 'transfer' })
    const wrapper = await mountView()

    expect(wrapper.get('.order-detail__muted').text()).toBe('3 fotos')
    expect(wrapper.text()).not.toContain('· Transferencia')
    expect(wrapper.text()).toContain('Gratis')
  })

  it('offers to retry when the order could not be loaded', async () => {
    Object.assign(state, { status: 'error', order: undefined, error: new Error('down') })
    const wrapper = await mountView()

    await button(wrapper, 'Reintentar')!.trigger('click')
    expect(refetch).toHaveBeenCalled()
  })
})
