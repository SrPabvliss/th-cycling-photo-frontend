<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { CameraOutline, LocationOutline, CalendarOutline, Star } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import { getAssetTransformUrl } from '@/shared/utils/cdn.utils'
import type { IPublicEventListItem } from '../../../types/responses/public-event-list.response'

const props = defineProps<{
  event: IPublicEventListItem
  featured?: boolean
}>()

const emit = defineEmits<{
  click: [slug: string]
}>()

const coverUrl = computed(() =>
  props.event.coverSlug ? getAssetTransformUrl(props.event.coverSlug, 'cover_small') : null,
)

const location = computed(() => {
  const parts = [props.event.cantonName, props.event.provinceName].filter(Boolean)
  return parts.join(', ') || null
})
</script>

<template>
  <article
    class="pub-event-card"
    :class="{ 'pub-event-card--featured': featured }"
    @click="emit('click', event.slug)"
  >
    <div class="pub-event-card__cover">
      <img v-if="coverUrl" :src="coverUrl" :alt="event.name" loading="lazy" />
      <div v-else class="pub-event-card__cover-placeholder" />
      <div v-if="featured" class="pub-event-card__featured-badge">
        <NIcon :component="Star" :size="12" />
        Destacado
      </div>
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
          {{ formatDate(event.date) }}
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped src="./public-event-card.css" />
