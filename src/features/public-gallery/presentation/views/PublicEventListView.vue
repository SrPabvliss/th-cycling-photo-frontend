<script setup lang="ts">
import { computed } from 'vue'
import { NButton } from 'naive-ui'

import HouseSpot from '@/features/house-spots/presentation/components/HouseSpot/HouseSpot.vue'
import { spotIndexAfter } from '@/features/house-spots/utils/spot-placement'
import { EmptyState } from '@/shared/components/empty-state'
import { LoadBoundary } from '@/shared/components/loading'
import { useInfiniteScrollTrigger } from '@/shared/composables/use-infinite-scroll-trigger'
import {
  PublicEventCard,
  PublicEventCardSkeleton,
  usePublicEventFiltersQuery,
  usePublicEventsQuery,
} from '@/shared/public-events'
import { useEventListFilters } from '../../composables/use-event-list-filters'
import EventFilterChips from '../components/EventFilterChips/EventFilterChips.vue'

const SKELETON_COUNT = 3

const { searchText, chip, filters, reset } = useEventListFilters()

const {
  status,
  events,
  isFetching,
  isPlaceholderData,
  isFetchingNextPage,
  isFetchNextPageError,
  hasNextPage,
  refetch,
  fetchNextPage,
} = usePublicEventsQuery(filters)

// Without the event types the list still filters by everything else: not an error of the screen.
const { data: filterOptions } = usePublicEventFiltersQuery()
const eventTypes = computed(() => filterOptions.value?.eventTypes ?? [])

// New filters are loading over the previous list: it stays on screen, dimmed. Loading one more
// page of the same list is not that.
const isRefreshing = computed(() => isFetching.value && !isFetchingNextPage.value)
// What is on screen while new filters load belongs to the previous ones: it says nothing yet
// about whether the new ones have results.
const isEmpty = computed(() => events.value.length === 0 && !isPlaceholderData.value)

const canLoadMore = computed(() => hasNextPage.value && !isFetchNextPageError.value)
const sentinel = useInfiniteScrollTrigger(() => fetchNextPage(), {
  isBusy: isFetching,
  canLoadMore,
})

// The house carousel spans the grid after the third card, or after the last of a shorter list.
const SPOT_AFTER = 3
const SPOT_SEED = 7
const spotAfter = computed(() => spotIndexAfter(events.value.length, SPOT_AFTER))
</script>

<template>
  <div class="event-list">
    <h1 class="event-list__title">Eventos</h1>

    <label class="event-list__search">
      <svg class="event-list__search-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <input
        v-model="searchText"
        class="event-list__search-input"
        type="search"
        placeholder="Busca por nombre o ciudad"
        aria-label="Buscar eventos"
        autocomplete="off"
        enterkeyhint="search"
      />
    </label>

    <EventFilterChips v-model="chip" :event-types="eventTypes" />

    <LoadBoundary
      :status="status"
      :empty="isEmpty"
      :refreshing="isRefreshing"
      error-title="No pudimos cargar los eventos"
      error-text="Puede ser tu conexión."
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
          title="No hay eventos con ese filtro"
          text="Prueba con otro nombre o quita el filtro."
        >
          <template #actions>
            <NButton text type="primary" size="large" @click="reset">Ver todos los eventos</NButton>
          </template>
        </EmptyState>
      </template>

      <div class="event-list__grid">
        <template v-for="(event, index) in events" :key="event.slug">
          <PublicEventCard :event="event" />
          <HouseSpot
            v-if="index === spotAfter"
            class="event-list__spot"
            format="AB"
            :seed="SPOT_SEED"
          />
        </template>
        <template v-if="isFetchingNextPage">
          <PublicEventCardSkeleton v-for="n in SKELETON_COUNT" :key="`next-${n}`" />
        </template>
      </div>

      <div v-if="canLoadMore" ref="sentinel" class="event-list__sentinel" aria-hidden="true" />

      <div v-if="hasNextPage && isFetchNextPageError" class="event-list__more">
        <NButton size="large" @click="fetchNextPage()">Cargar más</NButton>
      </div>
    </LoadBoundary>
  </div>
</template>

<style scoped src="./styles/public-event-list-view.css" />
