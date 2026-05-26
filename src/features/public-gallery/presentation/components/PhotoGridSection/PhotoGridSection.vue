<script setup lang="ts">
import { ref, watch } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { NIcon, NSpin } from 'naive-ui'
import { CheckmarkCircle, AddCircleOutline } from '@vicons/ionicons5'

import { getGalleryUrl } from '@/shared/utils/cdn.utils'
import type { IPublicPhoto } from '../../../types/responses/public-photo.response'

const props = defineProps<{
  photos: IPublicPhoto[]
  selectedIds: Set<string>
  baseIndex: number
  isLoadingMore?: boolean
  hasMore?: boolean
}>()

const emit = defineEmits<{
  toggle: [photoId: string]
  preview: [index: number]
  loadMore: []
}>()

// Plain CSS grid (no virtualizer) so two sections can coexist on the
// page-level scroll, separated by a divider. Sized for a few hundred
// photos per section; combined with native lazy-loading the perf hit is
// acceptable for our event volumes.
const sentinelRef = ref<HTMLElement | null>(null)

useIntersectionObserver(
  sentinelRef,
  ([entry]) => {
    if (entry?.isIntersecting && props.hasMore && !props.isLoadingMore) {
      emit('loadMore')
    }
  },
  { rootMargin: '300px 0px' },
)

// Refire when hasMore flips to true after a fetch (covers cases where
// the sentinel is already in view when the page resolves).
watch(
  () => props.hasMore,
  (now) => {
    const el = sentinelRef.value
    if (!el || !now || props.isLoadingMore) return
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight + 300) emit('loadMore')
  },
)
</script>

<template>
  <div class="grid-section">
    <div class="grid-section__grid">
      <div
        v-for="(photo, idx) in photos"
        :key="photo.id"
        class="grid-cell"
        :class="{ 'grid-cell--selected': selectedIds.has(photo.id) }"
      >
        <img
          :src="getGalleryUrl(photo.publicSlug)"
          alt=""
          loading="lazy"
          decoding="async"
          class="grid-cell__img"
          @click="emit('preview', baseIndex + idx)"
        />

        <button
          class="grid-cell__select"
          :class="{ 'grid-cell__select--active': selectedIds.has(photo.id) }"
          @click.stop="emit('toggle', photo.id)"
        >
          <NIcon
            :component="selectedIds.has(photo.id) ? CheckmarkCircle : AddCircleOutline"
            :size="22"
          />
        </button>
      </div>
    </div>

    <div ref="sentinelRef" class="grid-section__sentinel" />

    <div v-if="isLoadingMore" class="grid-section__loading">
      <NSpin size="small" />
    </div>
  </div>
</template>

<style scoped src="./photo-grid-section.css" />
