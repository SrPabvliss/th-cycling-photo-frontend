<script setup lang="ts">
import { NEmpty, NIcon, NList, NListItem, NThing } from 'naive-ui'
import { ImageOutline } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import type { IOperatorCompletedEvent } from '../../../types/responses/operator-completed-event.response'

defineProps<{
  items: IOperatorCompletedEvent[]
}>()
</script>

<template>
  <NEmpty
    v-if="items.length === 0"
    description="Aún no tienes eventos completados"
    :show-icon="false"
    size="small"
    class="completed-empty"
  />
  <NList v-else hoverable :show-divider="true" class="completed-list">
    <NListItem v-for="item in items" :key="item.event.id">
      <NThing>
        <template #avatar>
          <div
            class="completed__cover"
            :style="
              item.event.coverUrl ? { backgroundImage: `url(${item.event.coverUrl})` } : undefined
            "
          />
        </template>
        <template #header>
          <span class="completed__name">{{ item.event.name }}</span>
        </template>
        <template #description>
          <span class="completed__meta">
            <span>{{ formatDate(item.event.date) }}</span>
            <span class="completed__sep">·</span>
            <span class="completed__photos">
              <NIcon :component="ImageOutline" :size="12" />
              {{ item.event.totalPhotos }} fotos
            </span>
          </span>
        </template>
      </NThing>
    </NListItem>
  </NList>
</template>

<style scoped src="./operator-completed-list.css" />
