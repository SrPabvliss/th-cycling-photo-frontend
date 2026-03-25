<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NGrid, NGridItem, NResult } from 'naive-ui'

import { PHOTO_ROUTE_NAMES } from '@/features/photos/routes'
import PageHeader from '@/shared/components/PageHeader.vue'
import { useEventsListQuery } from '../../composables/queries/use-events-list'
import { useEventsStatsQuery } from '../../composables/queries/use-events-stats'
import { EVENT_ROUTE_NAMES } from '../../routes'
import type { IEventListItem } from '../../types/responses/event-list.response'
import EventListStatCards from '../components/EventListStatCards/EventListStatCards.vue'
import EventFilterBar from '../components/EventFilterBar/EventFilterBar.vue'
import EventCard from '../components/EventCard/EventCard.vue'
import EventCardSkeleton from '../components/EventCardSkeleton/EventCardSkeleton.vue'
import NewEventCard from '../components/NewEventCard/NewEventCard.vue'

const router = useRouter()
const page = ref(1)

const EVENTS_PER_PAGE = 5
const { data, isPending, isError, refetch } = useEventsListQuery(page, EVENTS_PER_PAGE)
const { data: stats } = useEventsStatsQuery()

function handleView(id: IEventListItem['id']) {
  router.push({ name: EVENT_ROUTE_NAMES.DETAIL, params: { id } })
}

function handleUpload(eventId: IEventListItem['id']) {
  router.push({ name: PHOTO_ROUTE_NAMES.UPLOAD, params: { eventId } })
}

function handleCreate() {
  router.push({ name: EVENT_ROUTE_NAMES.CREATE })
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content list-content">
      <PageHeader title="Gestión de Eventos" subtitle="Listado general de competencias" />
      <EventListStatCards :stats="stats" />
      <EventFilterBar
        :page="page"
        :page-count="data?.pagination?.totalPages ?? 0"
        @update:page="(p: number) => (page = p)"
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

      <!-- Grid: loading + content -->
      <template v-else>
        <NGrid :cols="3" :x-gap="24" :y-gap="16">
          <NGridItem>
            <NewEventCard @click="handleCreate" />
          </NGridItem>
          <template v-if="isPending">
            <NGridItem v-for="i in EVENTS_PER_PAGE" :key="i">
              <EventCardSkeleton />
            </NGridItem>
          </template>
          <template v-else-if="data">
            <NGridItem v-for="event in data.items" :key="event.id">
              <EventCard :event="event" @view="handleView" @upload="handleUpload" />
            </NGridItem>
          </template>
        </NGrid>
      </template>
    </div>
  </div>
</template>

<style scoped src="./event-list-view.css" />
