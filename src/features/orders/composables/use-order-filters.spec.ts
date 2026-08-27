import { describe, expect, it } from 'vitest'

import {
  orderFiltersToQuery,
  seedOrderFiltersFromQuery,
  useOrderFilters,
} from './use-order-filters'

describe('useOrderFilters', () => {
  it('defaults to the "all" tab, no event and no search', () => {
    const { search, eventId, tab, filters } = useOrderFilters()

    expect(search.value).toBe('')
    expect(eventId.value).toBeNull()
    expect(tab.value).toBe('all')
    expect(filters.value).toEqual({ search: null, eventId: null, tab: 'all' })
  })

  it('reflects ref changes in the filters computed', () => {
    const { search, eventId, tab, filters } = useOrderFilters()
    search.value = 'andrea'
    eventId.value = 'evt-1'
    tab.value = 'pending'

    expect(filters.value).toEqual({ search: 'andrea', eventId: 'evt-1', tab: 'pending' })
  })

  it('clearAll resets everything including the tab, which returns to "all"', () => {
    const { search, eventId, tab, clearAll } = useOrderFilters()
    search.value = 'andrea'
    eventId.value = 'evt-1'
    tab.value = 'cancelled'

    clearAll()

    expect(search.value).toBe('')
    expect(eventId.value).toBeNull()
    expect(tab.value).toBe('all')
  })

  it('seeds state from a query string and round-trips it back through orderFiltersToQuery', () => {
    const state = useOrderFilters()
    seedOrderFiltersFromQuery(state, { search: 'kevin', eventId: 'evt-2', tab: 'paid' })

    expect(state.search.value).toBe('kevin')
    expect(state.eventId.value).toBe('evt-2')
    expect(state.tab.value).toBe('paid')
    expect(orderFiltersToQuery(state.filters.value)).toEqual({
      search: 'kevin',
      eventId: 'evt-2',
      tab: 'paid',
    })
  })

  it('ignores an unknown tab value from the query string', () => {
    const state = useOrderFilters()
    seedOrderFiltersFromQuery(state, { tab: 'bogus' })

    expect(state.tab.value).toBe('all')
  })

  it('drops default tab and empty filters from the query representation', () => {
    const { filters } = useOrderFilters()

    expect(orderFiltersToQuery(filters.value)).toEqual({})
  })
})
