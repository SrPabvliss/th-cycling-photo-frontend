<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { CheckmarkCircle, ImagesOutline } from '@vicons/ionicons5'

import { formatRelativeTime } from '@/shared/utils/date.utils'
import type { IRecentActivity } from '../../../types/responses/operator-dashboard.response'

defineProps<{
  activities: IRecentActivity[]
}>()
</script>

<template>
  <div class="recent-activity">
    <div class="recent-activity__header">
      <h3 class="recent-activity__title">Actividad Reciente</h3>
    </div>

    <div v-if="activities.length === 0" class="recent-activity__empty">Sin actividad reciente</div>

    <div v-else class="recent-activity__list">
      <div v-for="(activity, index) in activities" :key="index" class="recent-activity__item">
        <div class="recent-activity__icon" :class="`recent-activity__icon--${activity.type}`">
          <NIcon
            :size="16"
            :component="activity.type === 'classification' ? CheckmarkCircle : ImagesOutline"
          />
        </div>
        <div class="recent-activity__content">
          <p class="recent-activity__description">{{ activity.description }}</p>
          <span class="recent-activity__time">
            {{ formatRelativeTime(activity.timestamp) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./recent-activity-list.css" />
