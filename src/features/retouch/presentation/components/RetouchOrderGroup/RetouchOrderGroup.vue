<script setup lang="ts">
import { NCard } from 'naive-ui'

import { formatRelativeTime } from '@/shared/utils/date.utils'
import type { IPendingRetouchGroup } from '../../../types/responses/pending-retouch.response'
import RetouchPhotoCard from '../RetouchPhotoCard/RetouchPhotoCard.vue'

defineProps<{
  group: IPendingRetouchGroup
}>()
</script>

<template>
  <NCard size="small">
    <template #header>
      <div class="retouch-group__header">
        <div>
          <span class="retouch-group__event">{{ group.eventName }}</span>
          <span class="retouch-group__sep"> · </span>
          <span class="retouch-group__customer">{{ group.userName }}</span>
        </div>
        <span class="retouch-group__time">{{ formatRelativeTime(group.orderCreatedAt) }}</span>
      </div>
    </template>
    <div class="retouch-group__photos">
      <RetouchPhotoCard v-for="photo in group.photos" :key="photo.id" :photo="photo" />
    </div>
  </NCard>
</template>

<style scoped src="./retouch-order-group.css" />
