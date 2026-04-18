<script setup lang="ts">
import { NFlex, NIcon } from 'naive-ui'
import { BrushOutline, TimeOutline } from '@vicons/ionicons5'

import { formatRelativeTime } from '@/shared/utils/date.utils'
import type { IRecentActivity } from '../../../types/responses/operator-dashboard.response'

defineProps<{
  activities: IRecentActivity[]
}>()
</script>

<template>
  <div class="recent-activity">
    <NFlex
      v-if="activities.length === 0"
      vertical
      align="center"
      :size="8"
      class="recent-activity__empty"
    >
      <NIcon :component="TimeOutline" :size="28" color="var(--tt-neutral-light)" />
      <span class="recent-activity__empty-text">Sin actividad reciente</span>
      <span class="recent-activity__empty-hint">
        La actividad aparecerá aquí cuando retoques fotos
      </span>
    </NFlex>

    <div v-else class="recent-activity__list">
      <div v-for="(activity, index) in activities" :key="index" class="recent-activity__item">
        <div class="recent-activity__icon" :class="`recent-activity__icon--${activity.type}`">
          <NIcon :size="16" :component="BrushOutline" />
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
