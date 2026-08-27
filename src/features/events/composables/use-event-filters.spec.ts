import { describe, expect, it } from 'vitest'

import {
  eventFiltersToQuery,
  seedEventFiltersFromQuery,
  useEventFilters,
} from './use-event-filters'

describe('useEventFilters', () => {
  it('defaults to the "all" tab, no organizer and "activity" sort', () => {
    const { tab, organizerId, sort, filters } = useEventFilters()

    expect(tab.value).toBe('all')
    expect(organizerId.value).toBeNull()
    expect(sort.value).toBe('activity')
    expect(filters.value).toEqual({
      search: null,
      tab: 'all',
      organizerId: null,
      sort: 'activity',
    })
  })

  it('reflects ref changes in the filters computed', () => {
    const { search, tab, organizerId, sort, filters } = useEventFilters()
    search.value = 'vuelta'
    tab.value = 'no_cover'
    organizerId.value = 'org-1'
    sort.value = 'revenue'

    expect(filters.value).toEqual({
      search: 'vuelta',
      tab: 'no_cover',
      organizerId: 'org-1',
      sort: 'revenue',
    })
  })

  it('clearAll resets everything including the tab and the organizer filter', () => {
    const { search, tab, organizerId, sort, clearAll } = useEventFilters()
    search.value = 'vuelta'
    tab.value = 'frozen'
    organizerId.value = 'org-1'
    sort.value = 'quota'

    clearAll()

    expect(search.value).toBe('')
    expect(tab.value).toBe('all')
    expect(organizerId.value).toBeNull()
    expect(sort.value).toBe('activity')
  })

  it('seeds state from a query string and round-trips it back through eventFiltersToQuery', () => {
    const state = useEventFilters()
    seedEventFiltersFromQuery(state, {
      search: 'giro',
      tab: 'archived',
      organizerId: 'org-9',
      sort: 'event_date',
    })

    expect(state.search.value).toBe('giro')
    expect(state.tab.value).toBe('archived')
    expect(state.organizerId.value).toBe('org-9')
    expect(state.sort.value).toBe('event_date')
    expect(eventFiltersToQuery(state.filters.value)).toEqual({
      search: 'giro',
      tab: 'archived',
      organizerId: 'org-9',
      sort: 'event_date',
    })
  })

  it('ignores an unknown tab or sort value from the query string', () => {
    const state = useEventFilters()
    seedEventFiltersFromQuery(state, { tab: 'bogus', sort: 'bogus' })

    expect(state.tab.value).toBe('all')
    expect(state.sort.value).toBe('activity')
  })

  it('drops default tab and sort from the query representation', () => {
    const { filters } = useEventFilters()

    expect(eventFiltersToQuery(filters.value)).toEqual({})
  })
})
