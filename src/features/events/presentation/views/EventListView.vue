<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NIcon, NResult, NSpin } from 'naive-ui'
import { BanOutline } from '@vicons/ionicons5'

import { PERMISSIONS } from '@/core/auth/permissions'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { useOrganizersListQuery } from '@/features/organizers/composables/queries/use-organizers-list'
import { useTenantProfile } from '@/features/tenant-profile/composables/queries/use-tenant-profile'
import { useMyContracts } from '@/features/tenant-profile/composables/queries/use-my-contracts'
import PageHeader from '@/shared/components/PageHeader/PageHeader.vue'
import { useInfiniteScrollTrigger } from '@/shared/composables/use-infinite-scroll-trigger'
import {
  EVENT_FILTER_STATE_KEY,
  SORT_LABELS,
  eventFiltersToQuery,
  seedEventFiltersFromQuery,
  useEventFilters,
} from '../../composables/use-event-filters'
import { useEventsListQuery } from '@/shared/composables/use-events-list'
import { useEventsStatsQuery } from '../../composables/queries/use-events-stats'
import { EVENT_ROUTE_NAMES } from '../../routes'
import type { EventRole } from '../../types/event-role'
import type { IEventListItem } from '../../types/responses/event-list.response'
import EventListStatCards from '../components/EventListStatCards/EventListStatCards.vue'
import EventTabs from '../components/EventTabs/EventTabs.vue'
import EventFilterBar from '../components/EventFilterBar/EventFilterBar.vue'
import EventCard from '../components/EventCard/EventCard.vue'
import EventCardSkeleton from '../components/EventCardSkeleton/EventCardSkeleton.vue'
import NewEventCard from '../components/NewEventCard/NewEventCard.vue'
import FirstRun from '../components/EventEmptyStates/FirstRun.vue'
import NoResults from '../components/EventEmptyStates/NoResults.vue'
import OperatorEmpty from '../components/EventEmptyStates/OperatorEmpty.vue'
import NoCoverNote from '../components/EventEmptyStates/NoCoverNote.vue'
import NoQuotaNote from '../components/EventEmptyStates/NoQuotaNote.vue'
import { formatNumber, pluralize } from '@/shared/utils/format.utils'

const SUBTITLES: Record<EventRole, string> = {
  titan: 'Todos los eventos de la plataforma, de todos los organizadores',
  organizer: 'Los eventos de {organizador}',
  operator: 'Los eventos en los que te asignaron',
}

const router = useRouter()
const route = useRoute()
const authStore = useSessionStore()

const role = computed<EventRole>(() => {
  const user = authStore.currentUser
  if (user?.permissions.includes(PERMISSIONS.EVENT_READ_ALL)) return 'titan'
  return user?.tenantId ? 'organizer' : 'operator'
})

const filterState = useEventFilters()
provide(EVENT_FILTER_STATE_KEY, filterState)
const { filters, clearAll } = filterState

seedEventFiltersFromQuery(filterState, route.query)

watch(
  filters,
  (value) => {
    router.replace({ query: eventFiltersToQuery(value) })
  },
  { deep: true },
)

const EVENTS_PER_PAGE = 12
const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useEventsListQuery(filters, EVENTS_PER_PAGE)
const { data: stats } = useEventsStatsQuery(filters)

const ORGANIZER_OPTIONS_LIMIT = 50

const organizersFilters = ref({ search: null, tab: 'all' as const, sort: 'recent' as const })
const isTitan = computed(() => role.value === 'titan')
const isOrganizer = computed(() => role.value === 'organizer')
const { data: organizersData } = useOrganizersListQuery(
  organizersFilters,
  ORGANIZER_OPTIONS_LIMIT,
  isTitan,
)
const organizerOptions = computed(() =>
  (organizersData.value?.pages[0]?.items ?? [])
    .filter((row) => row.kind === 'organizer')
    .map((row) => ({ label: row.name, value: row.id })),
)

const { data: tenantProfile } = useTenantProfile(isOrganizer)
const { data: myContracts } = useMyContracts(isOrganizer)

const subtitle = computed(() => {
  if (role.value !== 'organizer') return SUBTITLES[role.value]
  const name = tenantProfile.value?.publicName || tenantProfile.value?.name || 'tu organización'
  return SUBTITLES.organizer.replace('{organizador}', name)
})

const validContracts = computed(() =>
  (myContracts.value ?? []).filter(
    (contract) => contract.status === 'accepted' && contract.validUntil.getTime() >= Date.now(),
  ),
)

const hasCapacity = computed(() => {
  if (role.value !== 'organizer') return true
  if (myContracts.value == null) return true
  return validContracts.value.some((contract) => contract.eventsUsed < contract.eventsTotal)
})

const exhaustedContractTotal = computed<number | null>(() => {
  const exhausted = validContracts.value.find(
    (contract) => contract.eventsUsed >= contract.eventsTotal,
  )
  return exhausted?.eventsTotal ?? validContracts.value[0]?.eventsTotal ?? null
})

const showCreateAffordance = computed(() => role.value !== 'operator')

const events = computed(() => data.value?.pages.flatMap((p) => p.items) ?? [])
const resultsCount = computed(() => {
  const pages = data.value?.pages
  const lastPage = pages && pages.length > 0 ? pages[pages.length - 1] : undefined
  return lastPage ? lastPage.pagination.total : null
})

const hasActiveFilters = computed(
  () =>
    filters.value.search !== null ||
    filters.value.tab !== 'all' ||
    filters.value.organizerId !== null,
)

const activeEvents = computed(() =>
  filters.value.tab === 'all' ? events.value.filter((event) => !event.isArchived) : events.value,
)
const archivedEvents = computed(() =>
  filters.value.tab === 'all' ? events.value.filter((event) => event.isArchived) : [],
)

const sentinelRef = useInfiniteScrollTrigger(() => fetchNextPage(), {
  isBusy: computed(() => isFetchingNextPage.value),
  canLoadMore: computed(() => hasNextPage.value ?? false),
})

function handleView(slug: IEventListItem['slug']) {
  router.push({ name: EVENT_ROUTE_NAMES.DETAIL, params: { slug } })
}

function handleUpload(slug: string) {
  router.push({ name: ROUTE_NAMES.PHOTOS_UPLOAD, params: { slug } })
}

function handleCreate() {
  router.push({ name: EVENT_ROUTE_NAMES.CREATE })
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content list-content">
      <PageHeader title="Eventos" :subtitle="subtitle" />

      <NoQuotaNote
        v-if="role === 'organizer' && !hasCapacity"
        :events-total="exhaustedContractTotal"
      />

      <EventListStatCards :stats="stats" :role="role" />

      <div class="events-panel">
        <EventTabs
          :active="filterState.tab.value"
          :counts="stats?.tabs"
          @update:active="(tab) => (filterState.tab.value = tab)"
        />
        <EventFilterBar
          :role="role"
          :organizer-options="role === 'titan' ? organizerOptions : undefined"
        />

        <!-- Error -->
        <div v-if="isError" class="error-container">
          <NResult
            status="error"
            title="Error al cargar eventos"
            description="No se pudo obtener la lista de eventos."
          >
            <template #footer>
              <NButton @click="refetch()">Reintentar</NButton>
            </template>
          </NResult>
        </div>

        <div v-else-if="isPending" class="events-grid">
          <EventCardSkeleton v-for="i in EVENTS_PER_PAGE" :key="i" />
        </div>

        <template v-else-if="events.length === 0">
          <OperatorEmpty v-if="role === 'operator' && !hasActiveFilters" />
          <FirstRun v-else-if="!hasActiveFilters" />
          <NoResults v-else :query="filters.search" @clear="clearAll()" />
        </template>

        <template v-else>
          <NoCoverNote v-if="filters.tab === 'no_cover'" :count="stats?.tabs.no_cover ?? 0" />

          <div v-if="resultsCount != null" class="events-result-line">
            <b>{{ formatNumber(resultsCount) }}</b>
            {{ pluralize(resultsCount, 'evento', 'eventos') }}
            <span class="events-result-line__sub">
              · ordenados por {{ SORT_LABELS[filters.sort].toLowerCase() }} · desplaza para cargar
              más
            </span>
          </div>

          <div class="events-grid">
            <NewEventCard v-if="showCreateAffordance && hasCapacity" @click="handleCreate" />
            <span
              v-else-if="showCreateAffordance"
              class="events-no-capacity"
              data-test="no-capacity-tile"
            >
              <NIcon :component="BanOutline" :size="15" />
              Sin cupo para crear eventos
            </span>
            <EventCard
              v-for="event in activeEvents"
              :key="event.id"
              :event="event"
              :role="role"
              @view="handleView"
              @upload="handleUpload"
            />
          </div>

          <template v-if="archivedEvents.length > 0">
            <div class="events-group">
              <span>Archivados</span>
              <i>{{ archivedEvents.length }}</i>
            </div>
            <div class="events-grid">
              <EventCard
                v-for="event in archivedEvents"
                :key="event.id"
                :event="event"
                :role="role"
                @view="handleView"
                @upload="handleUpload"
              />
            </div>
          </template>

          <div ref="sentinelRef" class="events-sentinel" aria-hidden="true" />

          <div v-if="isFetchingNextPage" class="events-loading-more">
            <NSpin :size="20" /> <span>Cargando más...</span>
          </div>
          <p v-else-if="!hasNextPage" class="events-end-marker">No hay más eventos</p>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped src="./event-list-view.css" />
