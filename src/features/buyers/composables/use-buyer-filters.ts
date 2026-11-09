import { computed, inject, reactive, toRefs, type InjectionKey } from 'vue'
import type { LocationQuery } from 'vue-router'
import type { IBuyerFilters } from '../types/requests/buyer-filters.request'
import {
  DEFAULT_BUYER_FILTERS,
  GENDER_LABELS,
  PURCHASE_LABELS,
  SORT_LABELS,
} from '../constants/buyer-filters.constants'
import {
  buyerFiltersToQuery,
  parseBuyerFiltersFromQuery,
} from '../utils/buyer-filter-query.utils'
import { buildBuyerFilterChips, type IBuyerFilterChip } from '../utils/buyer-chips.utils'

export {
  GENDER_LABELS,
  PURCHASE_LABELS,
  SORT_LABELS,
  buyerFiltersToQuery,
  type IBuyerFilterChip,
}

export function useBuyerFilters() {
  const state = reactive<IBuyerFilters>({ ...DEFAULT_BUYER_FILTERS })
  const refs = toRefs(state)

  const activeChips = computed<IBuyerFilterChip[]>(() =>
    buildBuyerFilterChips(state, (key, val) => {
      state[key] = val
    }),
  )

  function clearAll() {
    Object.assign(state, DEFAULT_BUYER_FILTERS)
  }

  return {
    ...refs,
    filters: computed<IBuyerFilters>(() => ({ ...state })),
    activeChips,
    clearAll,
  }
}

export type IBuyerFilterState = ReturnType<typeof useBuyerFilters>

export const BUYER_FILTER_STATE_KEY: InjectionKey<IBuyerFilterState> = Symbol('buyer-filter-state')

export function useInjectedBuyerFilterState(): IBuyerFilterState {
  const filterState = inject(BUYER_FILTER_STATE_KEY)
  if (!filterState) {
    throw new Error(
      'useInjectedBuyerFilterState must be used within a component that provides BUYER_FILTER_STATE_KEY',
    )
  }
  return filterState
}

export function seedBuyerFiltersFromQuery(
  state: IBuyerFilterState,
  query: LocationQuery,
): void {
  const parsed = parseBuyerFiltersFromQuery(query)
  for (const [key, val] of Object.entries(parsed) as Array<[keyof IBuyerFilters, IBuyerFilters[keyof IBuyerFilters]]>) {
    if (key in state) {
      state[key].value = val as never
    }
  }
}
