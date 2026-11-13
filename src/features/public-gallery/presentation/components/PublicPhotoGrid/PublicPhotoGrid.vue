<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useWindowVirtualizer } from '@tanstack/vue-virtual'
import { useElementSize, useMediaQuery } from '@vueuse/core'

import tokens from '@/core/theme/client/awana-tokens.json'
import { ADS_ENABLED } from '@/features/ads/ads-config'
import AdSlot from '@/features/ads/presentation/components/AdSlot/AdSlot.vue'
import { isAdTile, withAdTile, type IAdTile } from '@/features/ads/utils/ad-placement'
import { TtSkeleton } from '@/shared/components/loading'
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
// The house ad tile: 13th cell, only when there are at least 13 photos (demo seed 59).
const AD_POSITION = 12
const AD_MIN_PHOTOS = 13
const AD_SEED = 59

const props = withDefaults(
  defineProps<{
    photos: IPublicPhoto[]
    selectedIds: Set<string>
    busyIds: Set<string>
    hasMore?: boolean
    isLoadingMore?: boolean
    /** A house ad tile among the photos. Never in a plate search. */
    withAd?: boolean
  }>(),
  { hasMore: false, isLoadingMore: false, withAd: false },
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

// The tile is a cell like a photo, 3:4 too, so every row keeps the same height. It is not a
// photo: the viewer moves through `photos`, never through these cells.
const adGone = ref(false)
const cells = computed<(IPublicPhoto | IAdTile)[]>(() =>
  props.withAd && ADS_ENABLED && !adGone.value
    ? withAdTile(props.photos, AD_POSITION, AD_MIN_PHOTOS)
    : props.photos,
)

const rows = computed(() => {
  const result: (IPublicPhoto | IAdTile)[][] = []
  for (let start = 0; start < cells.value.length; start += columns.value) {
    result.push(cells.value.slice(start, start + columns.value))
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
        <template v-for="cell in rows[row.index]" :key="isAdTile(cell) ? 'ad' : cell.id">
          <AdSlot v-if="isAdTile(cell)" format="C" :seed="AD_SEED" @unavailable="adGone = true" />
          <PhotoTile
            v-else
            :photo="cell"
            :selected="selectedIds.has(cell.id)"
            :busy="busyIds.has(cell.id)"
            @open="emit('open', $event)"
            @toggle="emit('toggle', $event)"
          />
        </template>
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
