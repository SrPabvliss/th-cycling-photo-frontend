<script setup lang="ts">
import { computed, ref } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { useElementSize } from '@vueuse/core'
import { NIcon } from 'naive-ui'
import { CheckmarkCircle, AddCircleOutline } from '@vicons/ionicons5'

import { getGalleryUrl } from '@/shared/utils/cdn.utils'
import type { IPublicPhoto } from '../../../types/responses/public-photo.response'

const GAP = 6
const ASPECT_RATIO = 4 / 3

const props = defineProps<{
  photos: IPublicPhoto[]
  selectedIds: Set<string>
}>()

const emit = defineEmits<{
  toggle: [photoId: string]
  preview: [index: number]
  loadMore: []
}>()

const parentRef = ref<HTMLElement | null>(null)
const { width: parentWidth } = useElementSize(parentRef)

const cols = computed(() => {
  if (parentWidth.value < 480) return 2
  if (parentWidth.value < 900) return 3
  if (parentWidth.value < 1280) return 4
  return 5
})

const cellWidth = computed(() => {
  if (parentWidth.value === 0) return 240
  const totalGap = GAP * (cols.value - 1)
  return Math.floor((parentWidth.value - totalGap) / cols.value)
})

const rowHeight = computed(() => Math.floor(cellWidth.value * ASPECT_RATIO))

function handleScroll() {
  const el = parentRef.value
  if (!el) return
  const { scrollTop, scrollHeight, clientHeight } = el
  if (scrollHeight - scrollTop - clientHeight < 300) {
    emit('loadMore')
  }
}

const rowCount = computed(() => Math.ceil(props.photos.length / cols.value))

const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: rowCount.value,
    getScrollElement: () => parentRef.value,
    estimateSize: () => rowHeight.value + GAP,
    overscan: 3,
  })),
)

const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems())
const totalSize = computed(() => rowVirtualizer.value.getTotalSize())

function getRowPhotos(rowIndex: number): IPublicPhoto[] {
  const start = rowIndex * cols.value
  return props.photos.slice(start, start + cols.value)
}

function getPhotoIndex(rowIndex: number, colIndex: number): number {
  return rowIndex * cols.value + colIndex
}
</script>

<template>
  <div ref="parentRef" class="virtual-grid" @scroll="handleScroll">
    <div :style="{ height: `${totalSize}px`, position: 'relative' }">
      <div
        v-for="virtualRow in virtualRows"
        :key="String(virtualRow.key)"
        :style="{
          position: 'absolute',
          top: `${virtualRow.start}px`,
          left: 0,
          right: 0,
          height: `${rowHeight}px`,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: `${GAP}px`,
        }"
      >
        <div
          v-for="(photo, colIdx) in getRowPhotos(virtualRow.index)"
          :key="photo.id"
          class="grid-cell"
          :class="{ 'grid-cell--selected': selectedIds.has(photo.id) }"
        >
          <img
            :src="getGalleryUrl(photo.publicSlug)"
            alt=""
            loading="lazy"
            class="grid-cell__img"
            @click="emit('preview', getPhotoIndex(virtualRow.index, colIdx))"
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
    </div>
  </div>
</template>

<style scoped src="./public-photo-grid.css" />
