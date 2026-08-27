import { describe, expect, it } from 'vitest'

import {
  organizerFiltersToQuery,
  seedOrganizerFiltersFromQuery,
  useOrganizerFilters,
} from './use-organizer-filters'

describe('useOrganizerFilters', () => {
  it('defaults to the "all" tab and "recent" sort', () => {
    const { tab, sort, filters } = useOrganizerFilters()

    expect(tab.value).toBe('all')
    expect(sort.value).toBe('recent')
    expect(filters.value).toEqual({ search: null, tab: 'all', sort: 'recent' })
  })

  it('reflects ref changes in the filters computed', () => {
    const { search, tab, sort, filters } = useOrganizerFilters()
    search.value = 'ciclo'
    tab.value = 'no_quota'
    sort.value = 'expiry'

    expect(filters.value).toEqual({ search: 'ciclo', tab: 'no_quota', sort: 'expiry' })
  })

  it('clearAll resets everything including the tab, which returns to "all"', () => {
    const { search, tab, sort, clearAll } = useOrganizerFilters()
    search.value = 'ciclo'
    tab.value = 'invitations'
    sort.value = 'events'

    clearAll()

    expect(search.value).toBe('')
    expect(tab.value).toBe('all')
    expect(sort.value).toBe('recent')
  })

  it('seeds state from a query string and round-trips it back through organizerFiltersToQuery', () => {
    const state = useOrganizerFilters()
    seedOrganizerFiltersFromQuery(state, { search: 'velo', tab: 'expiring', sort: 'available' })

    expect(state.search.value).toBe('velo')
    expect(state.tab.value).toBe('expiring')
    expect(state.sort.value).toBe('available')
    expect(organizerFiltersToQuery(state.filters.value)).toEqual({
      search: 'velo',
      tab: 'expiring',
      sort: 'available',
    })
  })

  it('ignores an unknown tab or sort value from the query string', () => {
    const state = useOrganizerFilters()
    seedOrganizerFiltersFromQuery(state, { tab: 'bogus', sort: 'bogus' })

    expect(state.tab.value).toBe('all')
    expect(state.sort.value).toBe('recent')
  })

  it('drops default tab and sort from the query representation', () => {
    const { filters } = useOrganizerFilters()

    expect(organizerFiltersToQuery(filters.value)).toEqual({})
  })
})
