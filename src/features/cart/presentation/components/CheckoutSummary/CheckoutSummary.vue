<script setup lang="ts">
import { computed } from 'vue'
import { NDivider } from 'naive-ui'

import { getGalleryUrl } from '@/shared/utils/cdn.utils'
import { formatDate } from '@/shared/utils/date.utils'
import type { ICartGroup } from '../../../types/responses/cart.response'

const props = defineProps<{ group: ICartGroup }>()

const photoCount = computed(() => props.group.photos.length)
const eventDateLabel = computed(() => {
  if (!props.group.startDate || !props.group.endDate) return ''
  const start = formatDate(props.group.startDate)
  if (props.group.startDate.getTime() === props.group.endDate.getTime()) return start
  return `${start} – ${formatDate(props.group.endDate)}`
})
</script>

<template>
  <article class="checkout-summary-card">
    <header class="checkout-summary-card__header">
      <div>
        <h3 class="checkout-summary-card__event">{{ group.eventName }}</h3>
        <p v-if="eventDateLabel" class="checkout-summary-card__date">{{ eventDateLabel }}</p>
      </div>
      <span class="checkout-summary-card__count">
        {{ photoCount }} foto{{ photoCount === 1 ? '' : 's' }}
      </span>
    </header>

    <NDivider class="checkout-summary-card__divider" />

    <div class="checkout-summary-card__grid">
      <div v-for="photo in group.photos" :key="photo.id" class="checkout-summary-card__thumb">
        <img :src="getGalleryUrl(photo.publicSlug)" :alt="`Foto ${photo.id}`" loading="lazy" />
      </div>
    </div>
  </article>
</template>

<style scoped src="./checkout-summary.css" />
