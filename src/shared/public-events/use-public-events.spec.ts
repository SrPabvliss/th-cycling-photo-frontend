import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { defineComponent, h, ref, type Ref } from 'vue'

import type { IApiPublicEventListItem, IPublicEventFilters } from './public-event.types'
import { usePublicEventFiltersQuery } from './use-public-event-filters'
import { usePublicEventsQuery } from './use-public-events'

const get = vi.fn()

vi.mock('@/core/http/axios-client', () => ({
  httpClient: { get: (...args: unknown[]) => get(...args) },
}))

function apiEvent(slug: string): IApiPublicEventListItem {
  return {
    slug,
    name: slug,
    startDate: '2026-10-04',
    endDate: '2026-10-04',
    provinceName: null,
    cantonName: null,
    photoCount: 1,
    ownerName: 'Titan TV',
    coverSlug: null,
    eventTypeId: 1,
    eventTypeName: 'Downhill',
  }
}

function page(slugs: string[], pageNumber: number, total: number, limit = 20) {
  return {
    data: slugs.map(apiEvent),
    meta: {
      pagination: { page: pageNumber, limit, total, totalPages: Math.ceil(total / limit) },
    },
  }
}

function withQuery<T>(setup: () => T): T {
  let result!: T
  const Host = defineComponent({
    setup() {
      result = setup()
      return () => h('div')
    },
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  mount(Host, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } })
  return result
}

const lastCall = () =>
  get.mock.calls[get.mock.calls.length - 1] as [string, { params: object; silent?: boolean }]

describe('usePublicEventsQuery', () => {
  // Braces on purpose: a function returned from beforeEach runs as its cleanup, and mockReset
  // returns the mock.
  beforeEach(() => {
    get.mockReset()
  })

  it('asks for the first page with no filter when given none', async () => {
    get.mockResolvedValue(page(['a', 'b'], 1, 2))

    const query = withQuery(() => usePublicEventsQuery())
    await flushPromises()

    const [url, config] = lastCall()
    expect(url).toBe('/public/events')
    expect(config.params).toEqual({ page: 1, limit: 20 })
    expect(query.events.value.map((event) => event.slug)).toEqual(['a', 'b'])
    expect(query.total.value).toBe(2)
  })

  it('stays quiet on failure: the screen shows the error, not a toast', async () => {
    get.mockResolvedValue(page([], 1, 0))

    withQuery(() => usePublicEventsQuery())
    await flushPromises()

    expect(lastCall()[1].silent).toBe(true)
  })

  it('sends the filters normalized', async () => {
    get.mockResolvedValue(page([], 1, 0))

    withQuery(() =>
      usePublicEventsQuery({
        search: '  mama ',
        eventTypeIds: [3, 1],
        provinceIds: [7],
        from: '2026-06',
        to: '2026-08',
      }),
    )
    await flushPromises()

    expect(lastCall()[1].params).toEqual({
      page: 1,
      limit: 20,
      search: 'mama',
      eventTypeIds: '1,3',
      provinceIds: '7',
      from: '2026-06',
      to: '2026-08',
    })
  })

  it('leaves out the filters that filter nothing', async () => {
    get.mockResolvedValue(page([], 1, 0))

    withQuery(() => usePublicEventsQuery({ search: 'm', eventTypeIds: [0], provinceIds: [] }))
    await flushPromises()

    expect(lastCall()[1].params).toEqual({ page: 1, limit: 20 })
  })

  it('takes its page size', async () => {
    get.mockResolvedValue(page([], 1, 0, 50))

    withQuery(() => usePublicEventsQuery(undefined, { pageSize: 50 }))
    await flushPromises()

    expect(lastCall()[1].params).toEqual({ page: 1, limit: 50 })
  })

  it('asks for page two next, and stops once everything is loaded', async () => {
    get.mockResolvedValueOnce(page(['a', 'b'], 1, 3, 2)).mockResolvedValueOnce(page(['c'], 2, 3, 2))

    const query = withQuery(() => usePublicEventsQuery(undefined, { pageSize: 2 }))
    await flushPromises()
    expect(query.hasNextPage.value).toBe(true)

    await query.fetchNextPage()
    await flushPromises()

    expect(lastCall()[1].params).toEqual({ page: 2, limit: 2 })
    expect(query.events.value.map((event) => event.slug)).toEqual(['a', 'b', 'c'])
    expect(query.total.value).toBe(3)
    expect(query.hasNextPage.value).toBe(false)
  })

  it('asks again when the filters change, keeping the previous list meanwhile', async () => {
    get.mockResolvedValueOnce(page(['a'], 1, 1))
    const filters: Ref<IPublicEventFilters> = ref({ eventTypeIds: [], provinceIds: [] })
    const query = withQuery(() => usePublicEventsQuery(filters))
    await flushPromises()

    let release: (value: unknown) => void = () => {}
    get.mockReturnValueOnce(new Promise((resolve) => (release = resolve)))
    filters.value = { search: 'mama', eventTypeIds: [], provinceIds: [] }
    await flushPromises()

    expect(lastCall()[1].params).toMatchObject({ search: 'mama' })
    expect(query.events.value.map((event) => event.slug)).toEqual(['a'])
    expect(query.status.value).toBe('success')

    release(page(['b'], 1, 1))
    await flushPromises()
    expect(query.events.value.map((event) => event.slug)).toEqual(['b'])
  })

  it('reports the failure of the first load as an error, with no events', async () => {
    get.mockRejectedValue(new Error('network'))

    const query = withQuery(() => usePublicEventsQuery())
    await vi.waitFor(() => expect(query.status.value).toBe('error'))

    expect(query.events.value).toEqual([])
    expect(query.total.value).toBe(0)
  })
})

describe('usePublicEventFiltersQuery', () => {
  // Braces on purpose: a function returned from beforeEach runs as its cleanup, and mockReset
  // returns the mock.
  beforeEach(() => {
    get.mockReset()
  })

  const options = (count: number) => ({
    data: {
      eventTypes: [{ id: 3, name: 'Downhill', count }],
      provinces: [{ id: 7, name: 'Cotopaxi', count, hasEvents: true }],
      months: [{ month: '2026-08', count }],
    },
    meta: {},
  })

  it('reads the options with their counts for the current filters, quietly', async () => {
    get.mockResolvedValue(options(4))

    const query = withQuery(() =>
      usePublicEventFiltersQuery({ eventTypeIds: [3], provinceIds: [], search: 'quito' }),
    )
    await flushPromises()

    expect(get).toHaveBeenCalledWith('/public/events/filters', {
      params: { search: 'quito', eventTypeIds: '3' },
      silent: true,
    })
    expect(query.data.value).toEqual(options(4).data)
  })

  it('keeps the previous counts while the new ones arrive', async () => {
    get.mockResolvedValueOnce(options(4))
    const filters: Ref<IPublicEventFilters> = ref({ eventTypeIds: [], provinceIds: [] })
    const query = withQuery(() => usePublicEventFiltersQuery(filters))
    await flushPromises()

    let release: (value: unknown) => void = () => {}
    get.mockReturnValueOnce(new Promise((resolve) => (release = resolve)))
    filters.value = { eventTypeIds: [3], provinceIds: [] }
    await flushPromises()

    expect(query.data.value?.eventTypes[0]?.count).toBe(4)

    release(options(1))
    await flushPromises()
    expect(query.data.value?.eventTypes[0]?.count).toBe(1)
  })
})
