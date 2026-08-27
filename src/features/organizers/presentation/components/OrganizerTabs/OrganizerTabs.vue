<script setup lang="ts">
import { TAB_LABELS } from '../../../composables/use-organizer-filters'
import type { OrganizerTab } from '../../../types/requests/organizer-filters.request'
import type { IOrganizersStats } from '../../../types/responses/organizers-stats.response'
import { formatNumber } from '@/shared/utils/format.utils'

const props = defineProps<{
  active: OrganizerTab
  counts: IOrganizersStats['tabs'] | undefined
}>()

const emit = defineEmits<{
  'update:active': [tab: OrganizerTab]
}>()

const TABS: Array<{ id: OrganizerTab; statsKey: keyof IOrganizersStats['tabs'] }> = [
  { id: 'all', statsKey: 'all' },
  { id: 'active', statsKey: 'active' },
  { id: 'no_quota', statsKey: 'noQuota' },
  { id: 'expiring', statsKey: 'expiring' },
  { id: 'invitations', statsKey: 'invitations' },
]

function countFor(statsKey: keyof IOrganizersStats['tabs']): string {
  if (props.counts == null) return '—'
  return formatNumber(props.counts[statsKey])
}

function select(tab: OrganizerTab) {
  emit('update:active', tab)
}
</script>

<template>
  <div class="ot-tabs">
    <button
      v-for="tab in TABS"
      :key="tab.id"
      type="button"
      class="ot-tab"
      :class="{ 'ot-tab--on': active === tab.id }"
      @click="select(tab.id)"
    >
      {{ TAB_LABELS[tab.id] }}<span class="ot-tab__n">{{ countFor(tab.statsKey) }}</span>
    </button>
  </div>
</template>

<style scoped src="./organizer-tabs.css" />
