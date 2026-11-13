<script setup lang="ts">
import { NEmpty, NSpin } from 'naive-ui'

import { PublicEventCard, usePublicEventsQuery } from '@/shared/public-events'

const { events: sortedEvents, isPending } = usePublicEventsQuery()
</script>

<template>
  <div class="pel">
    <div class="pel__header">
      <h1 class="pel__title">Eventos</h1>
      <p class="pel__subtitle">Encuentra tus fotos de competencia</p>
    </div>

    <div v-if="isPending" class="pel__loading">
      <NSpin size="large" />
    </div>

    <div v-else-if="sortedEvents.length > 0" class="pel__grid">
      <PublicEventCard v-for="event in sortedEvents" :key="event.slug" :event="event" />
    </div>

    <NEmpty v-else description="No hay eventos disponibles" class="pel__empty" />
  </div>
</template>

<style scoped src="./styles/public-event-list-view.css" />
