import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { computed, reactive } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { IPublicEventFilters, IPublicEventListItem } from '@/shared/public-events'
vi.mock('@/features/ads/presentation/components/AdSlot/AdSlot.vue', async () => ({
  default: (await import('@/features/ads/testing/ad-stubs')).AdSlotStub,
}))

import PublicEventListView from './PublicEventListView.vue'

type Status = 'pending' | 'error' | 'success'

const list = reactive({
  status: 'success' as Status,
  events: [] as IPublicEventListItem[],
  isFetching: false,
  isPlaceholderData: false,
  isFetchingNextPage: false,
  isFetchNextPageError: false,
  hasNextPage: false,
})
const types = reactive({
  isError: false,
  eventTypes: [
    { id: 3, name: 'Downhill' },
    { id: 5, name: 'Enduro' },
  ],
})
const refetch = vi.fn()
const fetchNextPage = vi.fn()
let askedWith: () => IPublicEventFilters = () => ({})

vi.mock('@/shared/public-events', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/public-events')>()),
  usePublicEventsQuery: (filters: { value: IPublicEventFilters }) => {
    askedWith = () => filters.value
    return {
      status: computed(() => list.status),
      events: computed(() => list.events),
      isFetching: computed(() => list.isFetching),
      isPlaceholderData: computed(() => list.isPlaceholderData),
      isFetchingNextPage: computed(() => list.isFetchingNextPage),
      isFetchNextPageError: computed(() => list.isFetchNextPageError),
      hasNextPage: computed(() => list.hasNextPage),
      refetch,
      fetchNextPage,
    }
  },
  usePublicEventFiltersQuery: () => ({
    data: computed(() => (types.isError ? undefined : { eventTypes: types.eventTypes })),
    isError: computed(() => types.isError),
  }),
}))

function event(slug: string): IPublicEventListItem {
  return {
    slug,
    name: `Evento ${slug}`,
    startDate: '2026-10-04',
    endDate: '2026-10-04',
    placeLabel: 'Ambato, Tungurahua',
    photoCount: 12,
    ownerName: 'Titan TV',
    coverUrl: null,
    eventTypeId: 3,
    eventTypeName: 'Downhill',
  }
}

const Stub = { render: () => null }

async function mountView(path = '/gallery') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/gallery', component: Stub },
      { path: '/gallery/:slug', component: Stub },
    ],
  })
  await router.push(path)
  const wrapper = mount(PublicEventListView, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router }
}

type Wrapper = Awaited<ReturnType<typeof mountView>>['wrapper']
const cards = (wrapper: Wrapper) => wrapper.findAll('a.event-card')
const skeletons = (wrapper: Wrapper) => wrapper.findAll('div.event-card[aria-hidden="true"]')
const chip = (wrapper: Wrapper, label: string) =>
  wrapper.findAll('.event-chips button').find((button) => button.text() === label)!
const search = (wrapper: Wrapper) => wrapper.get('input[aria-label="Buscar eventos"]')
const buttonNamed = (wrapper: Wrapper, name: string) =>
  wrapper.findAll('button').find((button) => button.text() === name)

describe('PublicEventListView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        disconnect() {}
      },
    )
    Object.assign(list, {
      status: 'success',
      events: [],
      isFetching: false,
      isPlaceholderData: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      hasNextPage: false,
    })
    types.isError = false
    refetch.mockClear()
    fetchNextPage.mockClear()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('has its title, the search field and the chips whatever the list is doing', async () => {
    list.status = 'pending'
    const { wrapper } = await mountView()

    expect(wrapper.get('h1').text()).toBe('Eventos')
    expect(search(wrapper).attributes('placeholder')).toBe('Busca por nombre o ciudad')
    expect(wrapper.findAll('.event-chips button').map((button) => button.text())).toEqual([
      'Todos',
      'Con fotos',
      'Downhill',
      'Enduro',
    ])
  })

  it('shows three skeletons once the load takes long, and nothing before', async () => {
    list.status = 'pending'
    const { wrapper } = await mountView()
    expect(skeletons(wrapper)).toHaveLength(0)

    await vi.advanceTimersByTimeAsync(400)

    expect(skeletons(wrapper)).toHaveLength(3)
    expect(wrapper.find('[aria-label="Cargando eventos"]').exists()).toBe(true)
  })

  it('shows the error, never "no events", when the load fails, and keeps what was typed', async () => {
    const { wrapper } = await mountView('/gallery?q=mama&tipo=3')
    list.status = 'error'
    await flushPromises()

    expect(wrapper.text()).toContain('No pudimos cargar los eventos')
    expect(wrapper.text()).toContain('Puede ser tu conexión.')
    expect(wrapper.text()).not.toContain('No hay eventos con ese filtro')
    expect((search(wrapper).element as HTMLInputElement).value).toBe('mama')
    expect(chip(wrapper, 'Downhill').attributes('aria-pressed')).toBe('true')
  })

  it('asks again with the same filters when retrying', async () => {
    list.status = 'error'
    const { wrapper } = await mountView('/gallery?q=mama&tipo=3')

    await buttonNamed(wrapper, 'Reintentar')!.trigger('click')

    expect(refetch).toHaveBeenCalledTimes(1)
    expect(askedWith()).toEqual({ search: 'mama', eventTypeId: 3 })
  })

  it('says there are no events for the filter and offers to see them all', async () => {
    const { wrapper, router } = await mountView('/gallery?q=zzz&fotos=1')

    expect(wrapper.text()).toContain('No hay eventos con ese filtro')
    expect(wrapper.text()).toContain('Prueba con otro nombre o quita el filtro.')

    await buttonNamed(wrapper, 'Ver todos los eventos')!.trigger('click')
    await flushPromises()

    expect((search(wrapper).element as HTMLInputElement).value).toBe('')
    expect(chip(wrapper, 'Todos').attributes('aria-pressed')).toBe('true')
    expect(askedWith()).toEqual({})
    expect(router.currentRoute.value.query).toEqual({})
  })

  describe('the house carousel', () => {
    const ad = (wrapper: Wrapper) => wrapper.find('[data-test="ad"]')
    const cardBefore = (wrapper: Wrapper) =>
      ad(wrapper).element.previousElementSibling?.getAttribute('href')

    it('spans the grid after the third card', async () => {
      list.events = ['a', 'b', 'c', 'd', 'e'].map(event)
      const { wrapper } = await mountView()

      expect(ad(wrapper).attributes('data-format')).toBe('AB')
      expect(ad(wrapper).attributes('data-seed')).toBe('7')
      expect(ad(wrapper).classes()).toContain('event-list__ad')
      expect(cardBefore(wrapper)).toBe('/gallery/c')
      expect(cards(wrapper)).toHaveLength(5)
    })

    it('goes after the last card when there are fewer than three', async () => {
      list.events = [event('a'), event('b')]
      const { wrapper } = await mountView()

      expect(cardBefore(wrapper)).toBe('/gallery/b')
    })

    it('never stands alone on an empty or failed list', async () => {
      list.events = []
      const empty = await mountView()
      expect(ad(empty.wrapper).exists()).toBe(false)

      list.status = 'error'
      const failed = await mountView()
      expect(ad(failed.wrapper).exists()).toBe(false)
    })
  })

  it('shows one card per event', async () => {
    list.events = [event('a'), event('b')]
    const { wrapper } = await mountView()

    expect(cards(wrapper).map((card) => card.attributes('href'))).toEqual([
      '/gallery/a',
      '/gallery/b',
    ])
    expect(wrapper.text()).not.toContain('No hay eventos con ese filtro')
  })

  it('keeps the previous list on screen, marked busy, while new filters load', async () => {
    list.events = [event('a'), event('b')]
    const { wrapper } = await mountView()

    list.isFetching = true
    list.isPlaceholderData = true
    await flushPromises()

    expect(cards(wrapper)).toHaveLength(2)
    expect(wrapper.get('.load-boundary').attributes('aria-busy')).toBe('true')
  })

  it('does not call an empty placeholder "no events" while the new filters load', async () => {
    const { wrapper } = await mountView()
    list.isFetching = true
    list.isPlaceholderData = true
    await flushPromises()

    expect(wrapper.text()).not.toContain('No hay eventos con ese filtro')
  })

  it('applies a chip when it is tapped', async () => {
    list.events = [event('a')]
    const { wrapper, router } = await mountView()

    await chip(wrapper, 'Con fotos').trigger('click')
    await flushPromises()

    expect(chip(wrapper, 'Con fotos').attributes('aria-pressed')).toBe('true')
    expect(chip(wrapper, 'Todos').attributes('aria-pressed')).toBe('false')
    expect(askedWith()).toEqual({ hasPhotos: true })
    expect(router.currentRoute.value.query).toEqual({ fotos: '1' })
  })

  it('searches once the typing stops', async () => {
    list.events = [event('a')]
    const { wrapper } = await mountView()

    await search(wrapper).setValue('mama')
    expect(askedWith()).toEqual({})

    await vi.advanceTimersByTimeAsync(250)
    expect(askedWith()).toEqual({ search: 'mama' })
  })

  it('has exactly the two fixed chips, and no error, when the event types fail to load', async () => {
    types.isError = true
    list.events = [event('a')]
    const { wrapper } = await mountView()

    expect(wrapper.findAll('.event-chips button').map((button) => button.text())).toEqual([
      'Todos',
      'Con fotos',
    ])
    expect(cards(wrapper)).toHaveLength(1)
    expect(wrapper.text()).not.toContain('No pudimos cargar')
  })

  it('shows skeletons at the end while the next page arrives', async () => {
    list.events = [event('a'), event('b')]
    list.hasNextPage = true
    list.isFetchingNextPage = true
    list.isFetching = true
    const { wrapper } = await mountView()

    expect(cards(wrapper)).toHaveLength(2)
    expect(skeletons(wrapper).length).toBeGreaterThan(0)
    expect(wrapper.get('.load-boundary').attributes('aria-busy')).toBeUndefined()
  })

  it('offers to load more by hand when the next page failed', async () => {
    list.events = [event('a'), event('b')]
    list.hasNextPage = true
    list.isFetchNextPageError = true
    const { wrapper } = await mountView()

    await buttonNamed(wrapper, 'Cargar más')!.trigger('click')

    expect(cards(wrapper)).toHaveLength(2)
    expect(fetchNextPage).toHaveBeenCalledTimes(1)
  })

  it('has no way to load more once everything is on screen', async () => {
    list.events = [event('a')]
    const { wrapper } = await mountView()

    expect(buttonNamed(wrapper, 'Cargar más')).toBeUndefined()
    expect(wrapper.find('.event-list__sentinel').exists()).toBe(false)
  })
})
