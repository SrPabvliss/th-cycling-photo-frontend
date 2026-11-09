<script setup lang="ts">
import { TAB_LABELS } from '../../../composables/use-event-filters'
import { EVENT_TABS, type EventTab } from '../../../types/requests/event-filters.request'
import type { IEventsStats } from '../../../types/responses/events-stats.response'
import { formatNumber } from '@/shared/utils/format.utils'

const props = defineProps<{
  active: EventTab
  counts: IEventsStats['tabs'] | undefined
}>()

const emit = defineEmits<{
  'update:active': [tab: EventTab]
}>()

function countFor(tab: EventTab): string {
  if (props.counts == null) return '—'
  return formatNumber(props.counts[tab])
}

function isWarn(tab: EventTab): boolean {
  return tab === 'no_cover' && (props.counts?.no_cover ?? 0) > 0
}

function select(tab: EventTab) {
  emit('update:active', tab)
}
</script>

<template>
  <div class="et-tabs">
    <button
      v-for="tab in EVENT_TABS"
      :key="tab"
      type="button"
      class="et-tab"
      :class="{ 'et-tab--on': active === tab, 'et-tab--warn': isWarn(tab) }"
      @click="select(tab)"
    >
      {{ TAB_LABELS[tab] }}<span class="et-tab__n">{{ countFor(tab) }}</span>
    </button>
  </div>
</template>

<style scoped src="./event-tabs.css" />
