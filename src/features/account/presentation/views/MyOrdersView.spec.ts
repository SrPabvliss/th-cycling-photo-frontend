import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { computed, reactive, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { IMyOrderListItem, MyOrderState } from '../../types/responses/my-order.response'
import MyOrdersView from './MyOrdersView.vue'

const state = reactive({
  status: 'success' as 'pending' | 'error' | 'success',
  orders: [] as IMyOrderListItem[],
  hasNextPage: false,
  nextPageError: false,
  fetchingNext: false,
})
const refetch = vi.fn()
const fetchNextPage = vi.fn()

vi.mock('../../composables/queries/use-my-orders', () => ({
  useMyOrdersQuery: () => ({
    status: computed(() => state.status),
    data: computed(() =>
      state.status === 'success' || state.orders.length
        ? { pages: [{ items: state.orders }] }
        : undefined,
    ),
    isFetching: ref(false),
    isFetchingNextPage: computed(() => state.fetchingNext),
    isFetchNextPageError: computed(() => state.nextPageError),
    hasNextPage: computed(() => state.hasNextPage),
    refetch,
    fetchNextPage,
  }),
}))

const order = (id: string, orderState: MyOrderState = 'ready'): IMyOrderListItem => ({
  id,
  state: orderState,
  eventName: `Evento ${id}`,
  createdAt: '2026-11-12T15:00:00.000Z',
  photoCount: 2,
  subtotal: '8.00',
  currency: 'USD',
  previewPhotos: [],
})

const mounted: { unmount(): void }[] = []
async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/account/orders', component: MyOrdersView },
      { path: '/:any(.*)*', component: { render: () => null } },
    ],
  })
  await router.push('/account/orders')
  mounted.push(
    mount(
      { template: '<RouterView />' },
      { attachTo: document.body, global: { plugins: [router] } },
    ),
  )
  await flushPromises()
  return new DOMWrapper(document.body)
}

function setVisibility(value: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => value })
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('MyOrdersView', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    Object.assign(state, {
      status: 'success',
      orders: [],
      hasNextPage: false,
      nextPageError: false,
      fetchingNext: false,
    })
    refetch.mockReset()
    fetchNextPage.mockReset()
    setVisibility('visible')
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
    vi.useRealTimers()
  })

  it('says the photos could not be loaded, never that there are none', async () => {
    state.status = 'error'
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('No pudimos cargar tus fotos')
    expect(wrapper.text()).not.toContain('Todavía no tienes fotos')
    await wrapper
      .findAll('button')
      .find((each) => each.text().includes('Reintentar'))!
      .trigger('click')
    expect(refetch).toHaveBeenCalled()
  })

  it('says there are no photos yet and where to find them', async () => {
    const wrapper = await mountView()

    expect(wrapper.get('h1').text()).toBe('Mis fotos')
    expect(wrapper.text()).toContain('Todavía no tienes fotos')
    expect(wrapper.text()).toContain(
      'Cuando compres fotos de una carrera, aparecen aquí para descargarlas cuando quieras.',
    )
    const find = wrapper.findAll('a').find((each) => each.text().trim() === 'Buscar mis fotos')
    expect(find?.attributes('href')).toBe('/gallery')
  })

  it('shows one row per order', async () => {
    state.orders = [order('o1'), order('o2'), order('o3')]
    const wrapper = await mountView()

    expect(wrapper.findAll('.order-row')).toHaveLength(3)
  })

  it('keeps the rows and offers to load more when the next page fails', async () => {
    state.orders = [order('o1'), order('o2')]
    state.hasNextPage = true
    state.nextPageError = true
    const wrapper = await mountView()

    expect(wrapper.findAll('.order-row')).toHaveLength(2)
    const more = wrapper.findAll('button').find((each) => each.text().trim() === 'Cargar más')!
    await more.trigger('click')
    expect(fetchNextPage).toHaveBeenCalled()
  })

  it('says every order is there once a long list is complete', async () => {
    state.orders = Array.from({ length: 7 }, (_, index) => order(`o${index}`))
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Esas son todas tus compras.')
  })

  it('asks again every 15 seconds while an order is confirming, and stops after', async () => {
    vi.useFakeTimers()
    state.orders = [order('o1', 'confirming')]
    await mountView()

    await vi.advanceTimersByTimeAsync(15_000)
    expect(refetch).toHaveBeenCalledTimes(1)

    state.orders = [order('o1', 'ready')]
    await flushPromises()
    await vi.advanceTimersByTimeAsync(45_000)
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('does not ask again while the tab is hidden', async () => {
    vi.useFakeTimers()
    state.orders = [order('o1', 'confirming')]
    await mountView()

    setVisibility('hidden')
    await vi.advanceTimersByTimeAsync(45_000)

    expect(refetch).not.toHaveBeenCalled()
  })
})
