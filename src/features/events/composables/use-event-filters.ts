import { computed, inject, ref, type InjectionKey } from 'vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import { SORT_LABELS, TAB_LABELS } from '../constants/event-filters.constants'
import {
  EVENT_SORTS,
  EVENT_TABS,
  type EventSort,
  type EventTab,
  type IEventFilters,
} from '../types/requests/event-filters.request'

const DEFAULT_TAB: EventTab = 'all'
const DEFAULT_SORT: EventSort = 'activity'

export { SORT_LABELS, TAB_LABELS }

export function useEventFilters() {
  const search = ref('')
  const tab = ref<EventTab>(DEFAULT_TAB)
  const organizerId = ref<string | null>(null)
  const sort = ref<EventSort>(DEFAULT_SORT)

  const filters = computed<IEventFilters>(() => ({
    search: search.value ? search.value : null,
    tab: tab.value,
    organizerId: organizerId.value,
    sort: sort.value,
  }))

  function clearAll() {
    search.value = ''
    tab.value = DEFAULT_TAB
    organizerId.value = null
    sort.value = DEFAULT_SORT
  }

  return {
    search,
    tab,
    organizerId,
    sort,
    filters,
    clearAll,
  }
}

export type IEventFilterState = ReturnType<typeof useEventFilters>

export const EVENT_FILTER_STATE_KEY: InjectionKey<IEventFilterState> = Symbol('event-filter-state')

export function useInjectedEventFilterState(): IEventFilterState {
  const filterState = inject(EVENT_FILTER_STATE_KEY)
  if (!filterState) {
    throw new Error(
      'useInjectedEventFilterState must be used within a component that provides EVENT_FILTER_STATE_KEY',
    )
  }
  return filterState
}

function queryString(value: LocationQuery[string] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' && raw ? raw : null
}

export function seedEventFiltersFromQuery(state: IEventFilterState, query: LocationQuery): void {
  const search = queryString(query.search)
  if (search !== null) state.search.value = search

  const tab = queryString(query.tab)
  if (tab !== null && EVENT_TABS.includes(tab as EventTab)) {
    state.tab.value = tab as EventTab
  }

  const organizerId = queryString(query.organizerId)
  if (organizerId !== null) state.organizerId.value = organizerId

  const sort = queryString(query.sort)
  if (sort !== null && EVENT_SORTS.includes(sort as EventSort)) {
    state.sort.value = sort as EventSort
  }
}

export function eventFiltersToQuery(filters: IEventFilters): LocationQueryRaw {
  const entries: Array<[string, string | null]> = [
    ['search', filters.search],
    ['tab', filters.tab !== DEFAULT_TAB ? filters.tab : null],
    ['organizerId', filters.organizerId],
    ['sort', filters.sort !== DEFAULT_SORT ? filters.sort : null],
  ]

  return Object.fromEntries(entries.filter((entry): entry is [string, string] => entry[1] !== null))
}
