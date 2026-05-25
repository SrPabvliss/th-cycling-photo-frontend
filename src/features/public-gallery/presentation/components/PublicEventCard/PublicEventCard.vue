<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { CameraOutline, LocationOutline, CalendarOutline } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import { getAssetPresetUrl } from '@/shared/utils/cdn.utils'
import type { IPublicEventListItem } from '../../../types/responses/public-event-list.response'

const props = defineProps<{
  event: IPublicEventListItem
}>()

const emit = defineEmits<{
  click: [slug: string]
}>()

const coverUrl = computed(() =>
  props.event.coverSlug ? getAssetPresetUrl(props.event.coverSlug, 'cover-sm') : null,
)

const location = computed(() => {
  const parts = [props.event.cantonName, props.event.provinceName].filter(Boolean)
  return parts.join(', ') || null
})

const isSingleDay = computed(
  () => props.event.startDate.getTime() === props.event.endDate.getTime(),
)
</script>

<template>
  <article class="pub-event-card" @click="emit('click', event.slug)">
    <div class="pub-event-card__cover">
      <img v-if="coverUrl" :src="coverUrl" :alt="event.name" loading="lazy" />
      <div v-else class="pub-event-card__cover-placeholder" />
      <div class="pub-event-card__overlay">
        <NIcon :component="CameraOutline" :size="14" />
        {{ event.photoCount }} fotos
      </div>
    </div>
    <div class="pub-event-card__body">
      <h3 class="pub-event-card__title">{{ event.name }}</h3>
      <div class="pub-event-card__meta">
        <span v-if="location">
          <NIcon :component="LocationOutline" :size="13" />
          {{ location }}
        </span>
        <span>
          <NIcon :component="CalendarOutline" :size="13" />
          <template v-if="isSingleDay">{{ formatDate(event.startDate) }}</template>
          <template v-else>
            {{ formatDate(event.startDate) }} – {{ formatDate(event.endDate) }}
          </template>
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped src="./public-event-card.css" />
