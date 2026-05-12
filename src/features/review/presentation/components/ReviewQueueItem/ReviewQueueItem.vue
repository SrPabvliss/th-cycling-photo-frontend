<script setup lang="ts">
import { computed } from 'vue'
import type { IReviewQueueItem } from '../../../types/review-queue-item.type'

const props = defineProps<{
  item: IReviewQueueItem
  isActive: boolean
}>()

const emit = defineEmits<{ select: [slug: string] }>()

const tagKind = computed<'success' | 'neutral' | 'error'>(() => {
  if (props.item.isRetouched) return 'success'
  if (props.item.reviewedAt) return 'success'
  if (props.item.status === 'failed') return 'error'
  return 'neutral'
})

const tagLabel = computed(() => {
  if (props.item.isRetouched) return 'retocada'
  if (props.item.reviewedAt) return 'revisada'
  if (props.item.status === 'failed') return 'error'
  return 'pendiente'
})
</script>

<template>
  <div
    class="rv-queue-item"
    :data-active="isActive"
    role="button"
    tabindex="0"
    :aria-label="`Seleccionar foto ${item.filename}, ${tagLabel}`"
    :aria-pressed="isActive"
    @click="emit('select', item.publicSlug)"
    @keydown.enter.prevent="emit('select', item.publicSlug)"
    @keydown.space.prevent="emit('select', item.publicSlug)"
  >
    <img
      v-if="item.thumbnailUrl"
      :src="item.thumbnailUrl"
      :alt="item.filename"
      class="rv-queue-item__thumb"
    />
    <div v-else class="rv-queue-item__thumb rv-placeholder" />

    <div class="rv-queue-item__meta">
      <div class="rv-queue-item__filename mono">{{ item.filename }}</div>
      <span class="rv-tag" :class="tagKind">{{ tagLabel }}</span>
    </div>
  </div>
</template>

<style scoped src="./review-queue-item.css" />
