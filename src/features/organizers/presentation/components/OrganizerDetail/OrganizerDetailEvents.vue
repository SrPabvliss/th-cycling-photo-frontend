<script setup lang="ts">
import type { IOrganizerEvent } from '../../../types/responses/organizer-event.response'
import { eventDatesLabel, eventPhotoLabel } from './organizer-detail.utils'

defineProps<{
  events: IOrganizerEvent[]
}>()
</script>

<template>
  <section class="od-sec">
    <h4>
      Eventos creados <span class="od-count">{{ events.length }}</span>
    </h4>
    <div v-if="events.length === 0" class="od-empty">
      <span class="od-empty__title">Sin eventos</span>
      <span class="od-empty__sub">Este organizador todavía no ha creado eventos.</span>
    </div>
    <ul v-else class="od-orders">
      <li v-for="event in events" :key="event.id">
        <span class="od-o__ev">{{ event.name }}</span>
        <span class="od-o__meta">{{ eventDatesLabel(event) }}</span>
        <span class="od-o__amt">{{ eventPhotoLabel(event) }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped src="./organizer-detail-events.css" />
