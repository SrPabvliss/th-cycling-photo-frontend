import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { AxiosError, type AxiosResponse } from 'axios'
import { computed, reactive } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { IMyOrderDetail } from '@/features/account/types/responses/my-order.response'
import PaymentConfirmedView from './PaymentConfirmedView.vue'

const order = (state: IMyOrderDetail['state'], photos: number): IMyOrderDetail => ({
  id: 'o1',
  state,
  eventName: 'Mama Rumi 2026',
  createdAt: '2026-11-13T10:00:00.000Z',
  subtotal: '9.00',
  currency: 'USD',
  canDownload: state === 'ready',
  canCancel: false,
  photos: Array.from({ length: photos }, (_, index) => ({ id: `p${index}`, galleryUrl: 'u' })),
  invoice: null,
  billing: null,
  confirmingTransactionId: null,
})

const state = reactive({
  status: 'success' as 'pending' | 'error' | 'success',
  order: order('ready', 3) as IMyOrderDetail | undefined,
  error: null as unknown,
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
      { path: '/checkout/confirmed/:orderId', component: PaymentConfirmedView },
    ],
  })
  await router.push('/checkout/confirmed/o1')
  mounted.push(
    mount(PaymentConfirmedView, { attachTo: document.body, global: { plugins: [router] } }),
  )
  await flushPromises()
  return { wrapper: new DOMWrapper(document.body), router }
}

const linkNamed = (wrapper: DOMWrapper<Element>, name: string) =>
  wrapper.findAll('a').find((each) => each.text().trim() === name)

describe('PaymentConfirmedView', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    Object.assign(state, { status: 'success', order: order('ready', 3), error: null })
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('says the photos are ready, and leads to download them', async () => {
    const { wrapper } = await mountView()

    expect(wrapper.get('h1').text()).toBe('Pago confirmado')
    expect(wrapper.text()).toContain(
      'Tus 3 fotos están listas para descargar en alta calidad. También te enviamos el enlace a tu correo.',
    )
    expect(linkNamed(wrapper, 'Ver y descargar mis fotos')?.attributes('href')).toBe(
      '/account/orders/o1',
    )
    expect(linkNamed(wrapper, 'Seguir explorando')?.attributes('href')).toBe('/gallery')
  })

  it('speaks of one photo when there is one', async () => {
    state.order = order('ready', 1)
    const { wrapper } = await mountView()

    expect(wrapper.text()).toContain(
      'Tu foto está lista para descargar en alta calidad. También te enviamos el enlace a tu correo.',
    )
  })

  it('does not claim a payment that is not settled: it opens the order instead', async () => {
    state.order = order('confirming', 3)
    const { wrapper, router } = await mountView()

    expect(router.currentRoute.value.path).toBe('/account/orders/o1')
    expect(wrapper.text()).not.toContain('Pago confirmado')
  })

  it('shows the not found state for an order that is not there', async () => {
    const response = { status: 404, data: {}, headers: {}, config: {} } as AxiosResponse
    Object.assign(state, {
      status: 'error',
      order: undefined,
      error: new AxiosError('nf', 'ERR_BAD_REQUEST', undefined, undefined, response),
    })
    const { wrapper } = await mountView()

    expect(wrapper.find('[data-test="not-found"]').exists()).toBe(true)
  })

  it('offers to retry when the order could not be loaded', async () => {
    Object.assign(state, { status: 'error', order: undefined, error: new Error('down') })
    const { wrapper } = await mountView()

    await wrapper
      .findAll('button')
      .find((each) => each.text().includes('Reintentar'))!
      .trigger('click')
    expect(refetch).toHaveBeenCalled()
  })
})
