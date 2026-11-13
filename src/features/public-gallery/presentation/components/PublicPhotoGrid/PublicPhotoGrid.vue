<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useWindowVirtualizer } from '@tanstack/vue-virtual'
import { useElementSize, useMediaQuery } from '@vueuse/core'

import { TtSkeleton } from '@/shared/components/loading'
import tokens from '@/core/theme/client/awana-tokens.json'
import type { IPublicPhoto } from '../../../types/responses/public-photo.response'
import PhotoTile from '../PhotoTile/PhotoTile.vue'

// The whole gallery of an event can be thousands of photos: only the rows near the viewport are
// in the page. It scrolls with the document, like the rest of the client area.
const COLUMNS_MOBILE = 3
const COLUMNS_DESKTOP = 5
const TILE_RATIO = 4 / 3
const LOADING_MORE_PLACEHOLDERS = 3
// Rows from the end at which the next page is asked for, before the person gets there.
const LOAD_MORE_MARGIN_ROWS = 2

const props = withDefaults(
  defineProps<{
    photos: IPublicPhoto[]
    selectedIds: Set<string>
    busyIds: Set<string>
    hasMore?: boolean
    isLoadingMore?: boolean
  }>(),
  { hasMore: false, isLoadingMore: false },
)

const emit = defineEmits<{
  open: [photoId: string]
  toggle: [photoId: string]
  loadMore: []
}>()

const container = ref<HTMLElement | null>(null)
const { width } = useElementSize(container)
// Same breakpoint and gaps as photo-grid.css.
const isDesktop = useMediaQuery('(min-width: 768px)')

const columns = computed(() => (isDesktop.value ? COLUMNS_DESKTOP : COLUMNS_MOBILE))
const gap = computed(() =>
  Number.parseInt(isDesktop.value ? tokens.spacing.space3 : tokens.spacing.space2, 10),
)
const rowHeight = computed(() => {
  const tileWidth = (width.value - gap.value * (columns.value - 1)) / columns.value
  return Math.max(0, tileWidth) * TILE_RATIO + gap.value
})

const rows = computed(() => {
  const result: IPublicPhoto[][] = []
  for (let start = 0; start < props.photos.length; start += columns.value) {
    result.push(props.photos.slice(start, start + columns.value))
  }
  return result
})

const scrollMargin = ref(0)
function measureOffset() {
  if (container.value) {
    scrollMargin.value = container.value.getBoundingClientRect().top + window.scrollY
  }
}
onMounted(measureOffset)

const virtualizer = useWindowVirtualizer(
  computed(() => ({
    count: rows.value.length,
    estimateSize: () => rowHeight.value,
    overscan: 4,
    scrollMargin: scrollMargin.value,
  })),
)

const virtualRows = computed(() => virtualizer.value.getVirtualItems())

watch([rowHeight, columns], () => {
  measureOffset()
  virtualizer.value.measure()
})

// Reaching the last rows asks for the next page.
watch(
  () => virtualRows.value[virtualRows.value.length - 1]?.index,
  (lastVisible) => {
    if (lastVisible === undefined || !props.hasMore || props.isLoadingMore) return
    if (lastVisible >= rows.value.length - 1 - LOAD_MORE_MARGIN_ROWS) emit('loadMore')
  },
)
</script>

<template>
  <div ref="container" class="photo-grid-virtual">
    <div class="photo-grid-virtual__rows" :style="{ height: `${virtualizer.getTotalSize()}px` }">
      <div
        v-for="row in virtualRows"
        :key="String(row.key)"
        class="photo-grid photo-grid-virtual__row"
        :style="{ transform: `translateY(${row.start - scrollMargin}px)` }"
      >
        <PhotoTile
          v-for="photo in rows[row.index]"
          :key="photo.id"
          :photo="photo"
          :selected="selectedIds.has(photo.id)"
          :busy="busyIds.has(photo.id)"
          @open="emit('open', $event)"
          @toggle="emit('toggle', $event)"
        />
      </div>
    </div>

    <div v-if="isLoadingMore" class="photo-grid photo-grid-virtual__more">
      <TtSkeleton
        v-for="n in LOADING_MORE_PLACEHOLDERS"
        :key="n"
        class="photo-grid__placeholder"
        height="auto"
        radius="m"
      />
    </div>
  </div>
</template>

<style scoped src="../photo-grid.css" />

<style scoped>
.photo-grid-virtual__rows {
  position: relative;
}

.photo-grid-virtual__row {
  position: absolute;
  inset-block-start: 0;
  inset-inline: 0;
}

.photo-grid-virtual__more {
  padding-block-start: var(--tt-space-2);
}
</style>
