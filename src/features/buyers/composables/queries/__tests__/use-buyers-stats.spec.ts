import { defineComponent, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { IBuyerFilters } from '../../../types/requests/buyer-filters.request'

const get = vi.fn()

vi.mock('@/core/http/axios-client', () => ({
  httpClient: { get: (...args: unknown[]) => get(...args) },
}))

vi.mock('../../../mappers/buyers-stats.mapper', () => ({
  toBuyersStats: (data: unknown) => data,
}))

import { useBuyersStatsQuery } from '../use-buyers-stats'

function mountQuery() {
  const filters = ref<IBuyerFilters>({
    search: null,
    purchase: 'all',
    countryId: null,
    provinceId: null,
    registeredFrom: null,
    registeredTo: null,
    gender: null,
    ageFrom: null,
    ageTo: null,
    emailVerified: null,
    hasWhatsapp: null,
    sort: 'recent',
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  let result: ReturnType<typeof useBuyersStatsQuery> | undefined
  const Host = defineComponent({
    setup() {
      result = useBuyersStatsQuery(filters)
      return {}
    },
    render: () => null,
  })
  mount(Host, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } })
  return { filters, query: () => result! }
}

describe('useBuyersStatsQuery', () => {
  beforeEach(() => {
    get.mockReset()
    get.mockResolvedValue({ data: { tabs: {} } })
  })

  it('keeps its data and does not refetch when only the purchase tab or the sort change', async () => {
    const { filters, query } = mountQuery()
    await flushPromises()

    filters.value = { ...filters.value, purchase: 'recurrent', sort: 'spent' }
    await flushPromises()

    expect(get).toHaveBeenCalledTimes(1)
    expect(query().data.value).toBeDefined()
  })

  it('refetches with every other filter when one of them changes', async () => {
    const { filters } = mountQuery()
    await flushPromises()

    filters.value = { ...filters.value, search: 'mena', countryId: 7, hasWhatsapp: true }
    await flushPromises()

    expect(get).toHaveBeenCalledTimes(2)
    expect(get).toHaveBeenLastCalledWith('/buyers/stats', {
      params: { search: 'mena', countryId: 7, hasWhatsapp: true },
    })
  })
})
