import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { computed, reactive, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { IMyOrderListItem, MyOrderState } from '../../types/responses/my-order.response'
vi.mock('@/features/house-spots/presentation/components/HouseSpot/HouseSpot.vue', async () => ({
  default: (await import('@/features/house-spots/testing/spot-stubs')).HouseSpotStub,
}))

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

    expect(wrapper.text()).toContain('No pudimos mostrar tus compras')
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

  it('puts the house carousel across the list after the fourth order', async () => {
    state.orders = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => order(id))
    const page = await mountView()

    const ad = page.get('[data-test="house-spot"]')
    expect(ad.attributes('data-format')).toBe('AB')
    expect(ad.attributes('data-seed')).toBe('11')
    expect(ad.classes()).toContain('my-orders__spot')
    expect(ad.element.previousElementSibling?.textContent).toContain('Evento d')
  })

  it('puts it after the only order of a one-order list, and never on an empty one', async () => {
    state.orders = [order('a')]
    const one = await mountView()
    expect(
      one.get('[data-test="house-spot"]').element.previousElementSibling?.textContent,
    ).toContain('Evento a')
    mounted.pop()!.unmount()

    state.orders = []
    const empty = await mountView()
    expect(empty.find('[data-test="house-spot"]').exists()).toBe(false)
  })

  it('shows one row per order', async () => {
    state.orders = [order('o1'), order('o2'), order('o3')]
    const wrapper = await mountView()

    expect(wrapper.findAll('.order-row')).toHaveLength(3)
  })

  it('keeps the rows and says the next page failed, with a retry, when it does', async () => {
    // vue-query marks the whole query as failed when only the next page did.
    state.status = 'error'
    state.orders = [order('o1'), order('o2')]
    state.hasNextPage = true
    state.nextPageError = true
    const wrapper = await mountView()

    expect(wrapper.findAll('.order-row')).toHaveLength(2)
    expect(wrapper.text()).not.toContain('No pudimos mostrar tus compras')
    const alert = wrapper.get('[data-test="more-problem"]')
    expect(alert.text()).toContain('No pudimos cargar más compras')
    await alert.get('button').trigger('click')
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
