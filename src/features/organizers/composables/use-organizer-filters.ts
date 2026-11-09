import { computed, inject, ref, type InjectionKey } from 'vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import {
  ORGANIZER_SORTS,
  ORGANIZER_TABS,
  type IOrganizerFilters,
  type OrganizerSort,
  type OrganizerTab,
} from '../types/requests/organizer-filters.request'

const DEFAULT_TAB: OrganizerTab = 'all'
const DEFAULT_SORT: OrganizerSort = 'recent'

export const TAB_LABELS: Record<OrganizerTab, string> = {
  all: 'Todos',
  active: 'Activos',
  no_quota: 'Sin cupo',
  expiring: 'Por vencer',
  invitations: 'Invitaciones',
}

export const SORT_LABELS: Record<OrganizerSort, string> = {
  recent: 'Recientes',
  available: 'Cupo restante',
  expiry: 'Vence antes',
  events: 'Más eventos',
}

export function useOrganizerFilters() {
  const search = ref('')
  const tab = ref<OrganizerTab>(DEFAULT_TAB)
  const sort = ref<OrganizerSort>(DEFAULT_SORT)

  const filters = computed<IOrganizerFilters>(() => ({
    search: search.value ? search.value : null,
    tab: tab.value,
    sort: sort.value,
  }))

  function clearAll() {
    search.value = ''
    tab.value = DEFAULT_TAB
    sort.value = DEFAULT_SORT
  }

  return {
    search,
    tab,
    sort,
    filters,
    clearAll,
  }
}

export type IOrganizerFilterState = ReturnType<typeof useOrganizerFilters>

export const ORGANIZER_FILTER_STATE_KEY: InjectionKey<IOrganizerFilterState> =
  Symbol('organizer-filter-state')

export function useInjectedOrganizerFilterState(): IOrganizerFilterState {
  const filterState = inject(ORGANIZER_FILTER_STATE_KEY)
  if (!filterState) {
    throw new Error(
      'useInjectedOrganizerFilterState must be used within a component that provides ORGANIZER_FILTER_STATE_KEY',
    )
  }
  return filterState
}

function queryString(value: LocationQuery[string] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' && raw ? raw : null
}

export function seedOrganizerFiltersFromQuery(
  state: IOrganizerFilterState,
  query: LocationQuery,
): void {
  const search = queryString(query.search)
  if (search !== null) state.search.value = search

  const tab = queryString(query.tab)
  if (tab !== null && ORGANIZER_TABS.includes(tab as OrganizerTab)) {
    state.tab.value = tab as OrganizerTab
  }

  const sort = queryString(query.sort)
  if (sort !== null && ORGANIZER_SORTS.includes(sort as OrganizerSort)) {
    state.sort.value = sort as OrganizerSort
  }
}

export function organizerFiltersToQuery(filters: IOrganizerFilters): LocationQueryRaw {
  const entries: Array<[string, string | null]> = [
    ['search', filters.search],
    ['tab', filters.tab !== DEFAULT_TAB ? filters.tab : null],
    ['sort', filters.sort !== DEFAULT_SORT ? filters.sort : null],
  ]

  return Object.fromEntries(entries.filter((entry): entry is [string, string] => entry[1] !== null))
}
