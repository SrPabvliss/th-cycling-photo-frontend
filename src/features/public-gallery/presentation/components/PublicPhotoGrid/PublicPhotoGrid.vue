<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useWindowVirtualizer } from '@tanstack/vue-virtual'
import { useWindowSize, useIntersectionObserver } from '@vueuse/core'

import { getGalleryUrl } from '@/shared/utils/cdn.utils'
import type { IPublicPhoto } from '../../../types/responses/public-photo.response'

const props = defineProps<{
  photos: IPublicPhoto[]
  selectedIds: Set<string>
  gridSize?: 'l' | 'm' | 's'
}>()

const emit = defineEmits<{
  toggle: [photoId: string]
  preview: [index: number]
  loadMore: []
}>()

const GAP = 10

const { width: windowWidth } = useWindowSize()

const cols = computed(() => {
  const size = props.gridSize ?? 'm'
  if (windowWidth.value >= 1024) {
    return size === 'l' ? 3 : size === 's' ? 6 : 4
  }
  if (windowWidth.value >= 768) {
    return size === 'l' ? 2 : size === 's' ? 4 : 3
  }
  return size === 's' ? 3 : 2
})

const rowHeight = computed(() => {
  const padding = windowWidth.value >= 768 ? 80 : 40
  const containerWidth = Math.min(windowWidth.value, 1440) - padding
  const colWidth = (containerWidth - GAP * (cols.value - 1)) / cols.value
  return Math.round(colWidth * (5 / 4)) + GAP
})

const rowCount = computed(() => Math.ceil(props.photos.length / cols.value))

const virtualizer = useWindowVirtualizer(
  computed(() => ({
    count: rowCount.value,
    estimateSize: () => rowHeight.value,
    overscan: 3,
  })),
)

watch([rowHeight, cols], () => {
  virtualizer.value.measure()
})

const virtualRows = computed(() => virtualizer.value.getVirtualItems())
const totalSize = computed(() => virtualizer.value.getTotalSize())

function getRowPhotos(rowIndex: number): IPublicPhoto[] {
  const start = rowIndex * cols.value
  return props.photos.slice(start, start + cols.value)
}

function getPhotoIndex(rowIndex: number, colIndex: number): number {
  return rowIndex * cols.value + colIndex
}

const sentinel = ref<HTMLElement | null>(null)
useIntersectionObserver(sentinel, ([entry]) => {
  if (entry?.isIntersecting) emit('loadMore')
})
</script>

<template>
  <div>
    <div :style="{ height: `${totalSize}px`, position: 'relative' }">
      <div
        v-for="virtualRow in virtualRows"
        :key="String(virtualRow.key)"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${virtualRow.size - GAP}px`,
          transform: `translateY(${virtualRow.start}px)`,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: `${GAP}px`,
        }"
      >
        <div
          v-for="(photo, colIdx) in getRowPhotos(virtualRow.index)"
          :key="photo.id"
          class="photo"
          :class="{ 'photo--selected': selectedIds.has(photo.id) }"
          @click="emit('preview', getPhotoIndex(virtualRow.index, colIdx))"
        >
          <img :src="getGalleryUrl(photo.publicSlug)" alt="" loading="lazy" />

          <div class="photo-watermark" />
          <div class="photo-frame" />

          <div class="photo-badge">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
            En tu pedido
          </div>

          <button
            class="photo-add-btn"
            :class="{ 'photo-add-btn--added': selectedIds.has(photo.id) }"
            aria-label="Agregar"
            @click.stop="emit('toggle', photo.id)"
          >
            <svg
              v-if="selectedIds.has(photo.id)"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
            <svg
              v-else
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          <div class="photo-id-tag">{{ photo.id.slice(0, 8).toUpperCase() }}</div>
        </div>
      </div>
    </div>

    <div ref="sentinel" class="sentinel" />
  </div>
</template>

<style scoped src="./public-photo-grid.css" />
