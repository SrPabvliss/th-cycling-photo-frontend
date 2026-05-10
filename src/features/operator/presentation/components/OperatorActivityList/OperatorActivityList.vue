<script setup lang="ts">
import { NEmpty, NIcon } from 'naive-ui'

import { formatRelativeTime } from '@/shared/utils/date.utils'
import { ACTIVITY_TYPE_ICONS } from '../../../constants/operator-activity'
import type { IRecentActivity } from '../../../types/responses/operator-recent-activity.response'

defineProps<{
  items: IRecentActivity[]
}>()
</script>

<template>
  <div v-if="items.length === 0" class="activity-empty">
    <NEmpty description="Sin actividad reciente" :show-icon="false" size="small" />
  </div>
  <ul v-else class="activity-list">
    <li v-for="a in items" :key="a.id" class="activity-list__item">
      <span
        class="activity-list__icon"
        :class="`activity-list__icon--${a.type}`"
        aria-hidden="true"
      >
        <NIcon :component="ACTIVITY_TYPE_ICONS[a.type]" :size="13" />
      </span>
      <div class="activity-list__body">
        <div class="activity-list__description">{{ a.description }}</div>
        <div class="activity-list__meta">{{ a.eventName }}</div>
      </div>
      <span class="activity-list__time">{{ formatRelativeTime(a.timestamp) }}</span>
    </li>
  </ul>
</template>

<style scoped src="./operator-activity-list.css" />
