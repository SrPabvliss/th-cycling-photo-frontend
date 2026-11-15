import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { computed, reactive } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { IPublicEventFilters, IPublicEventListItem } from '@/shared/public-events'
vi.mock('@/features/house-spots/presentation/components/HouseSpot/HouseSpot.vue', async () => ({
  default: (await import('@/features/house-spots/testing/spot-stubs')).HouseSpotStub,
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
  total: 0,
})
const options = reactive({
  isError: false,
  // Still on their way: no data yet, and no error.
  isLoading: false,
  eventTypes: [
    { id: 3, name: 'Downhill', count: 4 },
    { id: 5, name: 'Enduro', count: 2 },
  ],
  provinces: [
    { id: 3, name: 'Cañar', count: 0, hasEvents: false },
    { id: 7, name: 'Cotopaxi', count: 6, hasEvents: true },
  ],
})
const refetch = vi.fn()
const fetchNextPage = vi.fn()
const none = { eventTypeIds: [], provinceIds: [] }
let askedWith: () => IPublicEventFilters = () => none
let optionsAskedWith: () => IPublicEventFilters = () => none

vi.mock('@/shared/public-events', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/public-events')>()),
  usePublicEventsQuery: (filters: { value: IPublicEventFilters }) => {
    askedWith = () => filters.value
    return {
      status: computed(() => list.status),
      error: computed(() => null),
      events: computed(() => list.events),
      isFetching: computed(() => list.isFetching),
      isPlaceholderData: computed(() => list.isPlaceholderData),
      isFetchingNextPage: computed(() => list.isFetchingNextPage),
      isFetchNextPageError: computed(() => list.isFetchNextPageError),
      hasNextPage: computed(() => list.hasNextPage),
      total: computed(() => list.total),
      refetch,
      fetchNextPage,
    }
  },
  usePublicEventFiltersQuery: (filters: { value: IPublicEventFilters }) => {
    optionsAskedWith = () => filters.value
    return {
      data: computed(() =>
        options.isError || options.isLoading
          ? undefined
          : { eventTypes: options.eventTypes, provinces: options.provinces, months: [] },
      ),
      isError: computed(() => options.isError),
    }
  },
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
const filterButtons = (wrapper: Wrapper) =>
  wrapper.findAll('.event-filter__open').map((button) => button.text())
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
      total: 0,
    })
    options.isError = false
    options.isLoading = false
    refetch.mockClear()
    fetchNextPage.mockClear()
  })
  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('has its title, the search field and the three filters whatever the list is doing', async () => {
    list.status = 'pending'
    const { wrapper } = await mountView()

    expect(wrapper.get('h1').text()).toBe('Eventos')
    expect(search(wrapper).attributes('placeholder')).toBe('Busca evento o ciudad')
    expect(filterButtons(wrapper)).toEqual(['Disciplina', 'Provincia', 'Fecha'])
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

    expect(wrapper.text()).toContain('No pudimos mostrar los eventos')
    expect(wrapper.text()).toContain('Vuelve a intentarlo en un momento.')
    expect(wrapper.text()).not.toContain('Ningún evento con esos filtros')
    expect((search(wrapper).element as HTMLInputElement).value).toBe('mama')
    expect(filterButtons(wrapper)[0]).toBe('Downhill')
  })

  it('asks again with the same filters when retrying', async () => {
    list.status = 'error'
    const { wrapper } = await mountView('/gallery?q=mama&tipo=3')

    await buttonNamed(wrapper, 'Reintentar')!.trigger('click')

    expect(refetch).toHaveBeenCalledTimes(1)
    expect(askedWith()).toEqual({ search: 'mama', eventTypeIds: [3], provinceIds: [] })
  })

  it('says no event matches the filters and offers to clear them all, search included', async () => {
    const { wrapper, router } = await mountView('/gallery?q=zzz&tipo=3&prov=7')

    expect(wrapper.text()).toContain('Ningún evento con esos filtros')
    expect(wrapper.text()).toContain('Prueba quitando alguno o busca por otra ciudad.')

    await buttonNamed(wrapper, 'Limpiar filtros')!.trigger('click')
    await flushPromises()

    expect((search(wrapper).element as HTMLInputElement).value).toBe('')
    expect(filterButtons(wrapper)).toEqual(['Disciplina', 'Provincia', 'Fecha'])
    expect(askedWith()).toEqual(none)
    expect(router.currentRoute.value.query).toEqual({})
  })

  it('opens a shared link already filtered: the list, the counts and the buttons', async () => {
    const { wrapper } = await mountView('/gallery?tipo=3&prov=7&desde=2026-06&hasta=2026-08')

    const expected = {
      eventTypeIds: [3],
      provinceIds: [7],
      from: '2026-06',
      to: '2026-08',
    }
    expect(askedWith()).toEqual(expected)
    expect(optionsAskedWith()).toEqual(expected)
    expect(filterButtons(wrapper)).toEqual(['Downhill', 'Cotopaxi', 'Jun – Ago 2026'])
  })

  it('forgets a discipline or province of the link that the api does not offer', async () => {
    const { router } = await mountView('/gallery?tipo=3,99&prov=98')

    expect(askedWith()).toEqual({ eventTypeIds: [3], provinceIds: [] })
    expect(router.currentRoute.value.query).toEqual({ tipo: '3' })
  })

  it('keeps a province of the link that exists, even without events yet', async () => {
    const { wrapper, router } = await mountView('/gallery?prov=3')

    expect(askedWith()).toEqual({ eventTypeIds: [], provinceIds: [3] })
    expect(router.currentRoute.value.query).toEqual({ prov: '3' })
    expect(filterButtons(wrapper)[1]).toBe('Cañar')
  })

  // The list of a link with ids waits for them to be checked: no "0 eventos" painted for a
  // moment before an unknown one is dropped.
  it('shows no list for the ids of a link until they are checked', async () => {
    options.isLoading = true
    list.events = []
    list.total = 0
    const { wrapper, router } = await mountView('/gallery?prov=999')

    expect(wrapper.text()).not.toContain('Ningún evento con esos filtros')
    expect(wrapper.get('.event-list__count').text()).toBe('')

    list.events = [event('a')]
    list.total = 1
    options.isLoading = false
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({})
    expect(cards(wrapper)).toHaveLength(1)
    expect(wrapper.get('.event-list__count').text()).toBe('1 evento')
  })

  it('goes on with the ids of the link when the options cannot be read', async () => {
    options.isLoading = true
    list.events = [event('a')]
    list.total = 1
    const { wrapper } = await mountView('/gallery?prov=999')

    options.isLoading = false
    options.isError = true
    await flushPromises()

    expect(cards(wrapper)).toHaveLength(1)
  })

  // Before the skeleton shows (it waits a moment), the list keeps room: the footer does not jump.
  it('keeps room for the list while it loads', async () => {
    list.status = 'pending'
    const { wrapper } = await mountView()

    expect(wrapper.get('.event-list__body').classes()).toContain('event-list__body--loading')

    list.status = 'success'
    list.events = [event('a')]
    await flushPromises()
    expect(wrapper.get('.event-list__body').classes()).not.toContain('event-list__body--loading')
  })

  it('says how many events the filters bring, as it changes', async () => {
    list.events = [event('a')]
    list.total = 520
    const { wrapper } = await mountView()

    const count = wrapper.get('.event-list__count')
    expect(count.attributes('aria-live')).toBe('polite')
    expect(count.text()).toBe('520 eventos')

    list.total = 1
    await flushPromises()
    expect(count.text()).toBe('1 evento')
  })

  describe('the house carousel', () => {
    const ads = (wrapper: Wrapper) => wrapper.findAll('[data-test="house-spot"]')
    const cardBefore = (ad: ReturnType<Wrapper['find']>) =>
      (ad.element as Element).previousElementSibling?.getAttribute('href')
    const slugs = (count: number) => Array.from({ length: count }, (_, index) => `e${index + 1}`)

    it('spans the grid after the third card, then after every sixth', async () => {
      list.events = slugs(16).map(event)
      const { wrapper } = await mountView()

      expect(ads(wrapper).map(cardBefore)).toEqual(['/gallery/e3', '/gallery/e9', '/gallery/e15'])
      expect(ads(wrapper).map((ad) => ad.attributes('data-format'))).toEqual(['AB', 'AB', 'AB'])
      expect(ads(wrapper).every((ad) => ad.classes().includes('event-list__spot'))).toBe(true)
      expect(cards(wrapper)).toHaveLength(16)
    })

    it('starts each one on its own piece', async () => {
      list.events = slugs(16).map(event)
      const { wrapper } = await mountView()

      expect(ads(wrapper).map((ad) => ad.attributes('data-seed'))).toEqual(['7', '8', '9'])
    })

    it('has one, after the third, with four results', async () => {
      list.events = slugs(4).map(event)
      const { wrapper } = await mountView()

      expect(ads(wrapper).map(cardBefore)).toEqual(['/gallery/e3'])
    })

    it('goes after the last card when there are fewer than three', async () => {
      list.events = slugs(2).map(event)
      const { wrapper } = await mountView()

      expect(ads(wrapper).map(cardBefore)).toEqual(['/gallery/e2'])
    })

    // The pieces could not be downloaded: every band goes at once, as the gallery does, instead
    // of each frame dropping its height while the person scrolls.
    it('takes every band out when the pieces cannot be shown', async () => {
      list.events = slugs(16).map(event)
      const { wrapper } = await mountView()

      wrapper.getComponent({ name: 'HouseSpot' }).vm.$emit('unavailable')
      await flushPromises()

      expect(ads(wrapper)).toHaveLength(0)
      expect(cards(wrapper)).toHaveLength(16)
    })

    it('never stands alone on an empty or failed list', async () => {
      list.events = []
      const empty = await mountView()
      expect(ads(empty.wrapper)).toHaveLength(0)

      list.status = 'error'
      const failed = await mountView()
      expect(ads(failed.wrapper)).toHaveLength(0)
    })
  })

  it('shows one card per event', async () => {
    list.events = [event('a'), event('b')]
    const { wrapper } = await mountView()

    expect(cards(wrapper).map((card) => card.attributes('href'))).toEqual([
      '/gallery/a',
      '/gallery/b',
    ])
    expect(wrapper.text()).not.toContain('Ningún evento con esos filtros')
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

    expect(wrapper.text()).not.toContain('Ningún evento con esos filtros')
  })

  it('searches once the typing stops', async () => {
    list.events = [event('a')]
    const { wrapper } = await mountView()

    await search(wrapper).setValue('mama')
    expect(askedWith()).toEqual(none)

    await vi.advanceTimersByTimeAsync(250)
    expect(askedWith()).toEqual({ ...none, search: 'mama' })
  })

  it('keeps the three filters, and no error, when the options fail to load', async () => {
    options.isError = true
    list.events = [event('a')]
    const { wrapper } = await mountView()

    expect(filterButtons(wrapper)).toEqual(['Disciplina', 'Provincia', 'Fecha'])
    expect(cards(wrapper)).toHaveLength(1)
    expect(wrapper.text()).not.toContain('No pudimos')
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

  it('keeps the events and says the next page failed, with a retry, when it does', async () => {
    // vue-query marks the whole query as failed when only the next page did.
    Object.assign(list, {
      status: 'error',
      events: [event('a'), event('b')],
      hasNextPage: true,
      isFetchNextPageError: true,
    })
    const { wrapper } = await mountView()

    expect(cards(wrapper)).toHaveLength(2)
    expect(wrapper.text()).not.toContain('No pudimos mostrar los eventos')
    const alert = wrapper.get('[data-test="more-problem"]')
    expect(alert.classes()).toContain('form-alert')
    expect(alert.text()).toContain('No pudimos mostrar más eventos')
    expect(wrapper.find('.event-list__sentinel').exists()).toBe(false)

    await alert.get('button').trigger('click')
    expect(fetchNextPage).toHaveBeenCalledTimes(1)
  })

  it('has no way to load more once everything is on screen', async () => {
    list.events = [event('a')]
    const { wrapper } = await mountView()

    expect(wrapper.find('[data-test="more-problem"]').exists()).toBe(false)
    expect(wrapper.find('.event-list__sentinel').exists()).toBe(false)
  })
})
