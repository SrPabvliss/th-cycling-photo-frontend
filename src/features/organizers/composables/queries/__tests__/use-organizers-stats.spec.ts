import { defineComponent, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { IOrganizerFilters } from '../../../types/requests/organizer-filters.request'

const get = vi.fn()

vi.mock('@/core/http/axios-client', () => ({
  httpClient: { get: (...args: unknown[]) => get(...args) },
}))

vi.mock('../../../mappers/organizers-stats.mapper', () => ({
  toOrganizersStats: (data: unknown) => data,
}))

import { useOrganizersStatsQuery } from '../use-organizers-stats'

function mountQuery() {
  const filters = ref<IOrganizerFilters>({ search: null, tab: 'all', sort: 'recent' })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  let result: ReturnType<typeof useOrganizersStatsQuery> | undefined
  const Host = defineComponent({
    setup() {
      result = useOrganizersStatsQuery(filters)
      return {}
    },
    render: () => null,
  })
  mount(Host, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } })
  return { filters, query: () => result! }
}

describe('useOrganizersStatsQuery', () => {
  beforeEach(() => {
    get.mockReset()
    get.mockResolvedValue({ data: { tabs: {} } })
  })

  it('keeps its data and does not refetch when only the tab or the sort change', async () => {
    const { filters, query } = mountQuery()
    await flushPromises()

    filters.value = { ...filters.value, tab: 'expiring', sort: 'events' }
    await flushPromises()

    expect(get).toHaveBeenCalledTimes(1)
    expect(query().data.value).toBeDefined()
  })

  it('refetches when the search changes', async () => {
    const { filters } = mountQuery()
    await flushPromises()

    filters.value = { ...filters.value, search: 'titan' }
    await flushPromises()

    expect(get).toHaveBeenCalledTimes(2)
    expect(get).toHaveBeenLastCalledWith('/organizers/stats', { params: { search: 'titan' } })
  })
})
