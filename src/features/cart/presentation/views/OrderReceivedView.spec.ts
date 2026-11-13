import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { AxiosError, type AxiosResponse } from 'axios'
import { computed, reactive } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { IMyOrderDetail } from '@/features/account/types/responses/my-order.response'
import type { IUserPhone } from '@/features/account/types/responses/user-phone.response'
import OrderReceivedView from './OrderReceivedView.vue'

const ORDER: IMyOrderDetail = {
  id: '3f2a9c1b-0000-4000-8000-000000000000',
  state: 'in_process',
  eventName: 'Mama Rumi 2026',
  createdAt: '2026-11-13T10:00:00.000Z',
  subtotal: '9.00',
  currency: 'USD',
  canDownload: false,
  canCancel: true,
  photos: [
    { id: 'p1', galleryUrl: 'a' },
    { id: 'p2', galleryUrl: 'b' },
    { id: 'p3', galleryUrl: 'c' },
  ],
  invoice: null,
  billing: null,
  confirmingTransactionId: null,
}

const state = reactive({
  status: 'success' as 'pending' | 'error' | 'success',
  order: ORDER as IMyOrderDetail | undefined,
  error: null as unknown,
  phones: [] as IUserPhone[],
})
const refetch = vi.fn()

vi.mock('@/features/account/composables/queries/use-my-order-detail', () => ({
  useMyOrderDetailQuery: () => ({
    status: computed(() => state.status),
    data: computed(() => state.order),
    error: computed(() => state.error),
    isFetching: computed(() => false),
    refetch,
  }),
}))
vi.mock('@/features/account/composables/queries/use-my-phones', () => ({
  useMyPhonesQuery: () => ({ data: computed(() => state.phones) }),
}))
vi.mock('@/core/views/NotFoundView.vue', () => ({
  default: { template: '<div data-test="not-found">404</div>' },
}))

const mounted: { unmount(): void }[] = []

async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/gallery', component: { render: () => null } },
      { path: '/account/orders/:id', component: { render: () => null } },
      { path: '/checkout/received/:orderId', component: OrderReceivedView },
    ],
  })
  await router.push(`/checkout/received/${ORDER.id}`)
  const component = mount(OrderReceivedView, {
    attachTo: document.body,
    global: { plugins: [router] },
  })
  mounted.push(component)
  await flushPromises()
  return new DOMWrapper(document.body)
}

const linkNamed = (wrapper: DOMWrapper<Element>, name: string) =>
  wrapper.findAll('a').find((each) => each.text().trim() === name)

describe('OrderReceivedView', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    Object.assign(state, { status: 'success', order: ORDER, error: null, phones: [] })
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('says the order was received, with its code, photos and the amount the server set', async () => {
    const wrapper = await mountView()

    expect(wrapper.get('h1').text()).toBe('Pedido recibido')
    expect(wrapper.text()).toContain('3F2A9C1B')
    expect(wrapper.text()).toContain('3 fotos')
    expect(wrapper.get('.order-received__amount').text()).toBe('$9,00')
  })

  it('names the masked main phone WhatsApp will write to', async () => {
    state.phones = [
      { id: 'x', phoneNumber: '+593987770000', label: null, isWhatsapp: true, isPrimary: false },
      { id: 'y', phoneNumber: '+593991234567', label: null, isWhatsapp: true, isPrimary: true },
    ]
    const wrapper = await mountView()

    const lead = wrapper.get('.order-received__lead').text().replace(/\s+/g, ' ')
    expect(lead).toBe(
      'Te escribimos por WhatsApp al •••• 4567 con el total y los datos para pagar.',
    )
    expect(wrapper.text()).not.toContain('99123')
  })

  it('leaves the number out when the buyer has none', async () => {
    const wrapper = await mountView()

    expect(wrapper.get('.order-received__lead').text().replace(/\s+/g, ' ')).toBe(
      'Te escribimos por WhatsApp con el total y los datos para pagar.',
    )
  })

  it('lists the three steps, and no bank details or receipt button', async () => {
    const wrapper = await mountView()

    const steps = wrapper.findAll('.order-received__steps li').map((step) => step.text())
    expect(steps).toHaveLength(3)
    expect(steps[0]).toContain('Te escribimos por WhatsApp')
    expect(steps[1]).toContain('Transfieres y respondes ahí mismo')
    expect(steps[2]).toContain('Liberamos tus fotos')
    expect(wrapper.text()).not.toMatch(/n[uú]mero de cuenta|cuenta corriente|cuenta de ahorros/i)
    expect(wrapper.findAll('button').map((each) => each.text())).not.toContain('Subir comprobante')
  })

  it('opens the order and offers to keep exploring', async () => {
    const wrapper = await mountView()

    expect(linkNamed(wrapper, 'Ver mi pedido')?.attributes('href')).toBe(
      `/account/orders/${ORDER.id}`,
    )
    expect(linkNamed(wrapper, 'Seguir explorando')?.attributes('href')).toBe('/gallery')
  })

  it('shows the not found state for an order that is not there or not the buyer’s', async () => {
    const response = { status: 404, data: {}, headers: {}, config: {} } as AxiosResponse
    Object.assign(state, {
      status: 'error',
      order: undefined,
      error: new AxiosError('nf', 'ERR_BAD_REQUEST', undefined, undefined, response),
    })
    const wrapper = await mountView()

    expect(wrapper.find('[data-test="not-found"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Pedido recibido')
  })

  it('offers to retry when the order could not be loaded', async () => {
    Object.assign(state, { status: 'error', order: undefined, error: new Error('down') })
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('No pudimos cargar tu pedido')
    await wrapper
      .findAll('button')
      .find((each) => each.text().includes('Reintentar'))!
      .trigger('click')
    expect(refetch).toHaveBeenCalled()
  })
})
