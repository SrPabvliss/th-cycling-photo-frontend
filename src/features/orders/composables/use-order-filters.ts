import { computed, inject, ref, type InjectionKey } from 'vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import {
  ORDER_TABS,
  type IOrderFilters,
  type OrderTab,
} from '../types/requests/order-filters.request'

const DEFAULT_TAB: OrderTab = 'all'

export const ORDER_TAB_LABELS: Record<OrderTab, string> = {
  all: 'Todos',
  pending: 'Pendientes',
  payment_info_sent: 'Info enviada',
  paid: 'Pagados',
  delivered: 'Entregados',
  gifted: 'Regaladas',
  cancelled: 'Cancelados',
}

export function useOrderFilters() {
  const search = ref('')
  const eventId = ref<string | null>(null)
  const tab = ref<OrderTab>(DEFAULT_TAB)

  const filters = computed<IOrderFilters>(() => ({
    search: search.value ? search.value : null,
    eventId: eventId.value,
    tab: tab.value,
  }))

  function clearAll() {
    search.value = ''
    eventId.value = null
    tab.value = DEFAULT_TAB
  }

  return {
    search,
    eventId,
    tab,
    filters,
    clearAll,
  }
}

export type IOrderFilterState = ReturnType<typeof useOrderFilters>

export const ORDER_FILTER_STATE_KEY: InjectionKey<IOrderFilterState> = Symbol('order-filter-state')

export function useInjectedOrderFilterState(): IOrderFilterState {
  const filterState = inject(ORDER_FILTER_STATE_KEY)
  if (!filterState) {
    throw new Error(
      'useInjectedOrderFilterState must be used within a component that provides ORDER_FILTER_STATE_KEY',
    )
  }
  return filterState
}

function queryString(value: LocationQuery[string] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' && raw ? raw : null
}

export function seedOrderFiltersFromQuery(state: IOrderFilterState, query: LocationQuery): void {
  const search = queryString(query.search)
  if (search !== null) state.search.value = search

  const eventId = queryString(query.eventId)
  if (eventId !== null) state.eventId.value = eventId

  const tab = queryString(query.tab)
  if (tab !== null && ORDER_TABS.includes(tab as OrderTab)) {
    state.tab.value = tab as OrderTab
  }
}

export function orderFiltersToQuery(filters: IOrderFilters): LocationQueryRaw {
  const entries: Array<[string, string | null]> = [
    ['search', filters.search],
    ['eventId', filters.eventId],
    ['tab', filters.tab !== DEFAULT_TAB ? filters.tab : null],
  ]

  return Object.fromEntries(entries.filter((entry): entry is [string, string] => entry[1] !== null))
}
