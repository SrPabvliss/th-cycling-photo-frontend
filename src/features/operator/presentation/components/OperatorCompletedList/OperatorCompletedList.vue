<script setup lang="ts">
import { NEmpty, NIcon } from 'naive-ui'
import { ImageOutline } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import type { IOperatorCompletedEvent } from '../../../types/responses/operator-completed-event.response'

defineProps<{
  items: IOperatorCompletedEvent[]
}>()
</script>

<template>
  <div v-if="items.length === 0" class="completed-empty">
    <NEmpty description="Aún no tienes eventos completados" :show-icon="false" size="small" />
  </div>
  <ul v-else class="completed-list">
    <li v-for="item in items" :key="item.event.id" class="completed-list__item">
      <div
        class="completed-list__cover"
        :style="
          item.event.coverUrl ? { backgroundImage: `url(${item.event.coverUrl})` } : undefined
        "
      />
      <div class="completed-list__body">
        <div class="completed-list__name">{{ item.event.name }}</div>
        <div class="completed-list__meta">
          <span>{{ formatDate(item.event.date) }}</span>
          <span class="completed-list__sep">·</span>
          <span class="completed-list__photos">
            <NIcon :component="ImageOutline" :size="11" />
            {{ item.event.totalPhotos }} fotos
          </span>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped src="./operator-completed-list.css" />
