<script setup lang="ts">
import { NEmpty, NIcon, NList, NListItem } from 'naive-ui'

import { formatRelativeTime } from '@/shared/utils/date.utils'
import { ACTIVITY_TYPE_ICONS } from '../../../constants/operator-activity'
import type { IRecentActivity } from '../../../types/responses/operator-recent-activity.response'

defineProps<{
  items: IRecentActivity[]
}>()
</script>

<template>
  <NEmpty
    v-if="items.length === 0"
    description="Sin actividad reciente"
    :show-icon="false"
    size="small"
    class="activity-empty"
  />
  <NList v-else hoverable :show-divider="true" class="activity-list">
    <NListItem v-for="a in items" :key="a.id">
      <div class="activity-row">
        <span :class="['activity__icon', `activity__icon--${a.type}`]" aria-hidden="true">
          <NIcon :component="ACTIVITY_TYPE_ICONS[a.type]" :size="14" />
        </span>
        <div class="activity-row__body">
          <div class="activity-row__line">
            <span class="activity__description">{{ a.description }}</span>
            <span class="activity__time">{{ formatRelativeTime(a.timestamp) }}</span>
          </div>
          <span class="activity__meta">{{ a.eventName }}</span>
        </div>
      </div>
    </NListItem>
  </NList>
</template>

<style scoped src="./operator-activity-list.css" />
