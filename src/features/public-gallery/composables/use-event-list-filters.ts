import { computed, onScopeDispose, ref, watch, type ComputedRef, type Ref } from 'vue'
import { useRoute, useRouter, type LocationQuery } from 'vue-router'

import { SEARCH_DEBOUNCE_MS } from '@/shared/constants/search-debounce'
import { normalizePublicEventFilters, type IPublicEventFilters } from '@/shared/public-events'

/** One choice at a time: every event, only those with photos, or one event type by its id. */
export type EventListChip = 'all' | 'photos' | number

const QUERY_SEARCH = 'q'
const QUERY_WITH_PHOTOS = 'fotos'
const QUERY_EVENT_TYPE = 'tipo'

interface IUrlState {
  search: string
  chip: EventListChip
}

function first(value: LocationQuery[string] | undefined): string {
  const single = Array.isArray(value) ? value[0] : value
  return single ?? ''
}

function readUrl(query: LocationQuery): IUrlState {
  const eventTypeId = Number(first(query[QUERY_EVENT_TYPE]))
  const hasEventType = Number.isInteger(eventTypeId) && eventTypeId > 0

  return {
    search: first(query[QUERY_SEARCH]),
    chip: hasEventType ? eventTypeId : first(query[QUERY_WITH_PHOTOS]) === '1' ? 'photos' : 'all',
  }
}

function toFilters(search: string, chip: EventListChip): IPublicEventFilters {
  return normalizePublicEventFilters({
    search,
    eventTypeId: typeof chip === 'number' ? chip : undefined,
    hasPhotos: chip === 'photos',
  })
}

export interface IEventListFilters {
  /** What the search field shows; follows every key. */
  searchText: Ref<string>
  chip: Ref<EventListChip>
  /** What the list is asked with; the search part waits for the typing to stop. */
  filters: ComputedRef<IPublicEventFilters>
  reset(): void
}

/**
 * Filters of the events list, kept in the url (`q`, `fotos=1`, `tipo=<id>`) so that coming back
 * from a gallery, or sharing the link, brings the same list. The url is replaced, not pushed: a
 * search is not a page to go back to.
 */
export function useEventListFilters(): IEventListFilters {
  const route = useRoute()
  const router = useRouter()
  // The composable outlives the navigation by a moment: it only owns the url of its own screen.
  const ownPath = route.path

  const initial = readUrl(route.query)
  const searchText = ref(initial.search)
  const appliedSearch = ref(initial.search)
  const chip = ref<EventListChip>(initial.chip)

  const filters = computed(() => toFilters(appliedSearch.value, chip.value))

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

  watch(filters, (current) => {
    if (route.path !== ownPath) return

    const query = { ...route.query }
    delete query[QUERY_SEARCH]
    delete query[QUERY_WITH_PHOTOS]
    delete query[QUERY_EVENT_TYPE]
    if (current.search) query[QUERY_SEARCH] = current.search
    if (current.hasPhotos) query[QUERY_WITH_PHOTOS] = '1'
    if (current.eventTypeId) query[QUERY_EVENT_TYPE] = String(current.eventTypeId)

    router.replace({ query })
  })

  // Back and forward change the url under the screen: the state follows it.
  watch(
    () => route.query,
    (query) => {
      if (route.path !== ownPath) return cancelPendingSearch()

      const url = readUrl(query)
      const current = filters.value
      const fromUrl = toFilters(url.search, url.chip)
      if (JSON.stringify(fromUrl) === JSON.stringify(current)) return

      cancelPendingSearch()
      searchText.value = url.search
      appliedSearch.value = url.search
      chip.value = url.chip
    },
  )

  watch(() => route.path, cancelPendingSearch)

  function reset() {
    cancelPendingSearch()
    searchText.value = ''
    appliedSearch.value = ''
    chip.value = 'all'
  }

  onScopeDispose(cancelPendingSearch)

  return { searchText, chip, filters, reset }
}
