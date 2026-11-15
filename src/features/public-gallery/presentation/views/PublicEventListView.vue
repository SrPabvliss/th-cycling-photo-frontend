<script setup lang="ts">
import { computed, watch } from 'vue'
import { NButton } from 'naive-ui'

import { useOnline } from '@/core/network/use-online'
import HouseSpot from '@/features/house-spots/presentation/components/HouseSpot/HouseSpot.vue'
import { spotSlots } from '@/features/house-spots/utils/spot-placement'
import { EmptyState } from '@/shared/components/empty-state'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import { LoadBoundary } from '@/shared/components/loading'
import { useInfiniteScrollTrigger } from '@/shared/composables/use-infinite-scroll-trigger'
import {
  PublicEventCard,
  PublicEventCardSkeleton,
  usePublicEventFiltersQuery,
  usePublicEventsQuery,
} from '@/shared/public-events'
import { useEventListFilters } from '../../composables/use-event-list-filters'
import { eventsCountText } from '../../utils/event-filters'
import EventFilterBar from '../components/EventFilterBar/EventFilterBar.vue'

const SKELETON_COUNT = 3

const { searchText, eventTypeIds, provinceIds, months, filters, keepOnly, reset } =
  useEventListFilters()

const {
  status,
  events,
  error,
  isFetching,
  isPlaceholderData,
  isFetchingNextPage,
  isFetchNextPageError,
  hasNextPage,
  refetch,
  fetchNextPage,
  total,
} = usePublicEventsQuery(filters)

// The counts follow the filters. Without them the menus keep what they had and the list still
// works: not an error of the screen.
const { data: filterOptions } = usePublicEventFiltersQuery(filters)

// An old or edited link may name a discipline or province the api does not offer: it goes.
watch(
  () => filterOptions.value,
  (options) => {
    if (!options) return
    keepOnly(
      options.eventTypes.map((option) => option.id),
      options.provinces.filter((option) => option.hasEvents).map((option) => option.id),
    )
  },
  { immediate: true },
)

// How many events the filters bring, once the list knows; while new filters load, the last one.
const knownTotal = computed(() => (status.value === 'success' ? total.value : null))

// New filters are loading over the previous list: it stays on screen, dimmed. Loading one more
// page of the same list is not that.
const isRefreshing = computed(() => isFetching.value && !isFetchingNextPage.value)
// What is on screen while new filters load belongs to the previous ones: it says nothing yet
// about whether the new ones have results.
const isEmpty = computed(() => events.value.length === 0 && !isPlaceholderData.value)

const canLoadMore = computed(() => hasNextPage.value && !isFetchNextPageError.value)
// vue-query marks the whole query as failed when only the next page did: what is on screen stays,
// and the failure is said under it.
const listStatus = computed(() => (isFetchNextPageError.value ? 'success' : status.value))
const sentinel = useInfiniteScrollTrigger(() => fetchNextPage(), {
  isBusy: isFetching,
  canLoadMore,
})

// The house carousel spans the grid after the third card, then after every sixth; after the last
// of a shorter list. Each one starts on its own piece.
const SPOT_PLAN = { first: 3, every: 6 }
const SPOT_SEED = 7
// Index of the card each one goes after, and which appearance it is.
const spotAfter = computed(
  () => new Map(spotSlots(events.value.length, SPOT_PLAN).map((before, n) => [before - 1, n])),
)

// Without network the offline strip says it once: this alert does not repeat it.
const online = useOnline()
</script>

<template>
  <div class="event-list">
    <h1 class="event-list__title">Eventos</h1>

    <div class="event-list__tools">
      <label class="event-list__search">
        <svg class="event-list__search-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          v-model="searchText"
          class="event-list__search-input"
          type="search"
          placeholder="Busca evento o ciudad"
          aria-label="Buscar eventos"
          autocomplete="off"
          enterkeyhint="search"
        />
      </label>

      <EventFilterBar
        v-model:event-type-ids="eventTypeIds"
        v-model:province-ids="provinceIds"
        v-model:months="months"
        :options="filterOptions"
        :total="knownTotal"
      />
    </div>

    <p class="event-list__count" aria-live="polite">
      <template v-if="knownTotal !== null">{{ eventsCountText(knownTotal) }}</template>
    </p>

    <LoadBoundary
      :status="listStatus"
      :empty="isEmpty"
      :refreshing="isRefreshing"
      what="los eventos"
      :error="error"
      stacked
      @retry="refetch()"
    >
      <template #skeleton>
        <div class="event-list__grid" aria-label="Cargando eventos">
          <PublicEventCardSkeleton v-for="n in SKELETON_COUNT" :key="n" />
        </div>
      </template>

      <template #empty>
        <EmptyState
          illustration="sinEventos"
          title="Ningún evento con esos filtros"
          text="Prueba quitando alguno o busca por otra ciudad."
        >
          <template #actions>
            <NButton type="primary" size="large" @click="reset">Limpiar filtros</NButton>
          </template>
        </EmptyState>
      </template>

      <div class="event-list__grid">
        <template v-for="(event, index) in events" :key="event.slug">
          <PublicEventCard :event="event" />
          <HouseSpot
            v-if="spotAfter.has(index)"
            class="event-list__spot"
            format="AB"
            :seed="SPOT_SEED + spotAfter.get(index)!"
          />
        </template>
        <template v-if="isFetchingNextPage">
          <PublicEventCardSkeleton v-for="n in SKELETON_COUNT" :key="`next-${n}`" />
        </template>
      </div>

      <div v-if="canLoadMore" ref="sentinel" class="event-list__sentinel" aria-hidden="true" />

      <FormAlert
        v-if="hasNextPage && isFetchNextPageError && online"
        class="event-list__more"
        data-test="more-problem"
        tone="warn"
        title="No pudimos mostrar más eventos"
        text="Los que ya ves siguen aquí."
        :retrying="isFetchingNextPage"
        @retry="fetchNextPage()"
      />
    </LoadBoundary>
  </div>
</template>

<style scoped src="./styles/public-event-list-view.css" />
