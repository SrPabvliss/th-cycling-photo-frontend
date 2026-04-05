<script setup lang="ts">
import { computed, ref } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { useWindowSize } from '@vueuse/core'
import { NIcon } from 'naive-ui'
import { CheckmarkCircle, AddCircleOutline } from '@vicons/ionicons5'

import type { IPublicPhoto } from '../../../types/responses/public-photo.response'

const ROW_HEIGHT = 240
const GAP = 6

const { width: windowWidth } = useWindowSize()

const cols = computed(() => {
  if (windowWidth.value < 640) return 2
  if (windowWidth.value < 1024) return 3
  return 4
})

function handleScroll() {
  const el = parentRef.value
  if (!el) return
  const { scrollTop, scrollHeight, clientHeight } = el
  if (scrollHeight - scrollTop - clientHeight < 300) {
    emit('loadMore')
  }
}

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

const rowCount = computed(() => Math.ceil(props.photos.length / cols.value))

const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: rowCount.value,
    getScrollElement: () => parentRef.value,
    estimateSize: () => ROW_HEIGHT + GAP,
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
          height: `${ROW_HEIGHT}px`,
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
            :src="photo.url"
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
              :size="28"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./public-photo-grid.css" />
