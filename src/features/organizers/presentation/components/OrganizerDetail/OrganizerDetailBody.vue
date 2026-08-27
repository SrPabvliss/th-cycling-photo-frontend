<script setup lang="ts">
import type { IOrganizerDetail } from '../../../types/responses/organizer-detail.response'
import type { IOrganizerEvent } from '../../../types/responses/organizer-event.response'
import OrganizerDetailContracts from './OrganizerDetailContracts.vue'
import OrganizerDetailEvents from './OrganizerDetailEvents.vue'
import OrganizerDetailHero from './OrganizerDetailHero.vue'
import OrganizerDetailPayouts from './OrganizerDetailPayouts.vue'
import OrganizerDetailQuota from './OrganizerDetailQuota.vue'

withDefaults(
  defineProps<{
    organizer: IOrganizerDetail
    events: IOrganizerEvent[]
    canEditQuota?: boolean
  }>(),
  { canEditQuota: false },
)

const emit = defineEmits<{
  'update-quota': [value: number | null]
}>()
</script>

<template>
  <div class="od">
    <OrganizerDetailHero :organizer="organizer" :show-identity="false" />
    <OrganizerDetailQuota :organizer="organizer" :show-settings="false" />
    <OrganizerDetailHero :organizer="organizer" :show-banner="false" />
    <OrganizerDetailContracts :contracts="organizer.contracts" />
    <OrganizerDetailEvents :events="events" />
    <OrganizerDetailPayouts :payouts="organizer.payouts" />
    <OrganizerDetailQuota
      :organizer="organizer"
      :can-edit-quota="canEditQuota"
      :show-summary="false"
      @update-quota="emit('update-quota', $event)"
    />
  </div>
</template>

<style scoped src="./organizer-detail-body.css" />
