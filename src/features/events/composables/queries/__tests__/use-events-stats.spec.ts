import { defineComponent, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { IEventFilters } from '../../../types/requests/event-filters.request'

const get = vi.fn()

vi.mock('@/core/http/axios-client', () => ({
  httpClient: { get: (...args: unknown[]) => get(...args) },
}))

vi.mock('../../../mappers/events-stats.mapper', () => ({
  toEventsStats: (data: unknown) => data,
}))

import { useEventsStatsQuery } from '../use-events-stats'

function mountQuery() {
  const filters = ref<IEventFilters>({
    search: null,
    tab: 'all',
    organizerId: null,
    sort: 'activity',
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  let result: ReturnType<typeof useEventsStatsQuery> | undefined
  const Host = defineComponent({
    setup() {
      result = useEventsStatsQuery(filters)
      return {}
    },
    render: () => null,
  })
  mount(Host, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } })
  return { filters, query: () => result! }
}

describe('useEventsStatsQuery', () => {
  beforeEach(() => {
    get.mockReset()
    get.mockResolvedValue({ data: { tabs: {} } })
  })

  it('keeps its data and does not refetch when only the tab or the sort change', async () => {
    const { filters, query } = mountQuery()
    await flushPromises()

    filters.value = { ...filters.value, tab: 'frozen', sort: 'revenue' }
    await flushPromises()

    expect(get).toHaveBeenCalledTimes(1)
    expect(query().data.value).toBeDefined()
  })

  it('refetches when the search or the organizer change', async () => {
    const { filters } = mountQuery()
    await flushPromises()

    filters.value = { ...filters.value, search: 'rumi', organizerId: 'org-1' }
    await flushPromises()

    expect(get).toHaveBeenCalledTimes(2)
    expect(get).toHaveBeenLastCalledWith('/events/stats', {
      params: { search: 'rumi', organizerId: 'org-1' },
    })
  })
})
