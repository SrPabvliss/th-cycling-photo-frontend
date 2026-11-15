import { computed, onScopeDispose, ref, watch, type ComputedRef, type Ref } from 'vue'
import { useRoute, useRouter, type LocationQuery, type LocationQueryRaw } from 'vue-router'

import { SEARCH_DEBOUNCE_MS } from '@/shared/constants/search-debounce'
import { normalizePublicEventFilters, type IPublicEventFilters } from '@/shared/public-events'

/** A month or a range of months, `YYYY-MM`, both ends included. One month: `from` equals `to`. */
export interface IMonthRange {
  from: string
  to: string
}

const QUERY_SEARCH = 'q'
const QUERY_EVENT_TYPES = 'tipo'
const QUERY_PROVINCES = 'prov'
const QUERY_FROM = 'desde'
const QUERY_TO = 'hasta'
// "With photos" is gone: old links still carry it, and it is dropped from them.
const QUERY_GONE = ['fotos']
const OWN_KEYS = [
  QUERY_SEARCH,
  QUERY_EVENT_TYPES,
  QUERY_PROVINCES,
  QUERY_FROM,
  QUERY_TO,
  ...QUERY_GONE,
]

interface IUrlState {
  search: string
  eventTypeIds: number[]
  provinceIds: number[]
  months: IMonthRange | null
}

function first(value: LocationQuery[string] | undefined): string {
  const single = Array.isArray(value) ? value[0] : value
  return single ?? ''
}

// "1,2": the ids it can read, each once, in the order given; anything else is dropped.
function readIds(value: LocationQuery[string] | undefined): number[] {
  const ids = first(value)
    .split(',')
    .map((part) => Number(part))
    .filter((id) => Number.isInteger(id) && id > 0)
  return [...new Set(ids)]
}

function readMonths(query: LocationQuery): IMonthRange | null {
  const { from, to } = normalizePublicEventFilters({
    eventTypeIds: [],
    provinceIds: [],
    from: first(query[QUERY_FROM]) || undefined,
    to: first(query[QUERY_TO]) || undefined,
  })
  return from && to ? { from, to } : null
}

function readUrl(query: LocationQuery): IUrlState {
  return {
    search: first(query[QUERY_SEARCH]),
    eventTypeIds: readIds(query[QUERY_EVENT_TYPES]),
    provinceIds: readIds(query[QUERY_PROVINCES]),
    months: readMonths(query),
  }
}

function toFilters(state: IUrlState): IPublicEventFilters {
  return normalizePublicEventFilters({
    search: state.search,
    eventTypeIds: state.eventTypeIds,
    provinceIds: state.provinceIds,
    from: state.months?.from,
    to: state.months?.to,
  })
}

/** The url of the state, other parameters left as they are. */
function toQuery(state: IUrlState, current: LocationQuery): LocationQueryRaw {
  const query: LocationQueryRaw = { ...current }
  OWN_KEYS.forEach((key) => delete query[key])
  const { search } = toFilters(state)
  if (search) query[QUERY_SEARCH] = search
  if (state.eventTypeIds.length) query[QUERY_EVENT_TYPES] = state.eventTypeIds.join(',')
  if (state.provinceIds.length) query[QUERY_PROVINCES] = state.provinceIds.join(',')
  if (state.months) {
    query[QUERY_FROM] = state.months.from
    query[QUERY_TO] = state.months.to
  }
  return query
}

function sameQuery(a: LocationQueryRaw, b: LocationQuery): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  return [...keys].every((key) => String(a[key] ?? '') === String(b[key] ?? ''))
}

export interface IEventListFilters {
  /** What the search field shows; follows every key. */
  searchText: Ref<string>
  /** Chosen disciplines and provinces, in the order they were chosen. */
  eventTypeIds: Ref<number[]>
  provinceIds: Ref<number[]>
  months: Ref<IMonthRange | null>
  /** What the list is asked with; the search part waits for the typing to stop. */
  filters: ComputedRef<IPublicEventFilters>
  /** Something is chosen in the menus (the search aside). */
  hasChoices: ComputedRef<boolean>
  /** Clears the three menus, keeping the search. */
  clearChoices(): void
  /** Clears the menus and the search, without waiting. */
  reset(): void
  /** Forgets ids that are not among the choices the api offers (an old or edited link). */
  keepOnly(eventTypeIds: number[], provinceIds: number[]): void
}

/**
 * Filters of the events list, kept in the url (`q`, `tipo=1,2`, `prov=3,7`, `desde` and `hasta`
 * as `YYYY-MM`) so that coming back from a gallery, or sharing the link, brings the same list.
 * The url is replaced, not pushed: a choice is not a page to go back to. What it cannot read is
 * dropped without a word, and the url is cleaned of it.
 */
export function useEventListFilters(): IEventListFilters {
  const route = useRoute()
  const router = useRouter()
  // The composable outlives the navigation by a moment: it only owns the url of its own screen.
  const ownPath = route.path

  const initial = readUrl(route.query)
  const searchText = ref(initial.search)
  const appliedSearch = ref(initial.search)
  const eventTypeIds = ref<number[]>(initial.eventTypeIds)
  const provinceIds = ref<number[]>(initial.provinceIds)
  const months = ref<IMonthRange | null>(initial.months)

  const state = computed<IUrlState>(() => ({
    search: appliedSearch.value,
    eventTypeIds: eventTypeIds.value,
    provinceIds: provinceIds.value,
    months: months.value,
  }))
  const filters = computed(() => toFilters(state.value))
  const hasChoices = computed(
    () => eventTypeIds.value.length > 0 || provinceIds.value.length > 0 || months.value !== null,
  )

  let timer: ReturnType<typeof setTimeout> | undefined
  function cancelPendingSearch() {
    clearTimeout(timer)
    timer = undefined
  }

  watch(searchText, (text) => {
    cancelPendingSearch()
    if (text === appliedSearch.value) return
    timer = setTimeout(() => (appliedSearch.value = text), SEARCH_DEBOUNCE_MS)
  })

  function writeUrl() {
    if (route.path !== ownPath) return
    const query = toQuery(state.value, route.query)
    if (!sameQuery(query, route.query)) router.replace({ query })
  }

  // A link with something it could not read, or an old "with photos", is cleaned at once.
  writeUrl()
  watch(state, writeUrl)

  // Back and forward change the url under the screen: the state follows it.
  watch(
    () => route.query,
    (query) => {
      if (route.path !== ownPath) return cancelPendingSearch()

      const url = readUrl(query)
      if (JSON.stringify(toFilters(url)) === JSON.stringify(filters.value)) return

      cancelPendingSearch()
      searchText.value = url.search
      appliedSearch.value = url.search
      eventTypeIds.value = url.eventTypeIds
      provinceIds.value = url.provinceIds
      months.value = url.months
    },
  )

  watch(() => route.path, cancelPendingSearch)

  function clearChoices() {
    eventTypeIds.value = []
    provinceIds.value = []
    months.value = null
  }

  function reset() {
    cancelPendingSearch()
    searchText.value = ''
    appliedSearch.value = ''
    clearChoices()
  }

  function keepOnly(knownEventTypes: number[], knownProvinces: number[]) {
    const types = eventTypeIds.value.filter((id) => knownEventTypes.includes(id))
    const provinces = provinceIds.value.filter((id) => knownProvinces.includes(id))
    if (types.length !== eventTypeIds.value.length) eventTypeIds.value = types
    if (provinces.length !== provinceIds.value.length) provinceIds.value = provinces
  }

  onScopeDispose(cancelPendingSearch)

  return {
    searchText,
    eventTypeIds,
    provinceIds,
    months,
    filters,
    hasChoices,
    clearChoices,
    reset,
    keepOnly,
  }
}
