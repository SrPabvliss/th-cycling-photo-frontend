<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NEmpty, NSpin } from 'naive-ui'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { usePublicEventsQuery } from '../../composables/queries/use-public-events'
import { PUBLIC_GALLERY_ROUTE_NAMES } from '../../routes'
import PublicEventCard from '../components/PublicEventCard/PublicEventCard.vue'

const router = useRouter()
const { data: events, isPending } = usePublicEventsQuery()

const sortedEvents = computed(() =>
  [...(events.value ?? [])].sort((a, b) => b.startDate.getTime() - a.startDate.getTime()),
)

function handleEventClick(slug: string) {
  router.push({ name: PUBLIC_GALLERY_ROUTE_NAMES.EVENT_GALLERY, params: { slug } })
}
</script>

<template>
  <PublicLayout>
    <div class="pel">
      <div class="pel__header">
        <h1 class="pel__title">Eventos</h1>
        <p class="pel__subtitle">Encuentra tus fotos de competencia</p>
      </div>

      <div v-if="isPending" class="pel__loading">
        <NSpin size="large" />
      </div>

      <div v-else-if="sortedEvents.length > 0" class="pel__grid">
        <PublicEventCard
          v-for="event in sortedEvents"
          :key="event.slug"
          :event="event"
          @click="handleEventClick"
        />
      </div>

      <NEmpty v-else description="No hay eventos disponibles" class="pel__empty" />
    </div>
  </PublicLayout>
</template>

<style scoped src="./styles/public-event-list-view.css" />
