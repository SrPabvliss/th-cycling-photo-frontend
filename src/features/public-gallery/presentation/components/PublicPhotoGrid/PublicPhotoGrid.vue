<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useWindowVirtualizer } from '@tanstack/vue-virtual'
import { useElementSize, useMediaQuery } from '@vueuse/core'

import tokens from '@/core/theme/client/awana-tokens.json'
import { SPOTS_ENABLED } from '@/features/house-spots/spots-config'
import HouseSpot from '@/features/house-spots/presentation/components/HouseSpot/HouseSpot.vue'
import {
  isSpotTile,
  spotSlotsInside,
  withSpotTiles,
  type ISpotTile,
} from '@/features/house-spots/utils/spot-placement'
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
// House ad tiles: before the 8th photo, 18 photos further down, then one every 30. Neither 18
// nor 30 is a multiple of 3 or 5: each next tile lands in another column. One never closes the
// gallery, so the first needs at least 8 photos. Each one starts on its own piece.
const SPOT_PLAN = { first: 7, second: 18, every: 30 }
const SPOT_SEED = 59

const props = withDefaults(
  defineProps<{
    photos: IPublicPhoto[]
    selectedIds: Set<string>
    busyIds: Set<string>
    hasMore?: boolean
    isLoadingMore?: boolean
    /** A house ad tile among the photos. Never in a plate search. */
    withSpot?: boolean
  }>(),
  { hasMore: false, isLoadingMore: false, withSpot: false },
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
// photo: the viewer moves through `photos`, never through these cells. Their places depend only
// on the photos before them, so a new page never moves the cells already placed.
const spotGone = ref(false)
const cells = computed<(IPublicPhoto | ISpotTile)[]>(() =>
  props.withSpot && SPOTS_ENABLED && !spotGone.value
    ? withSpotTiles(props.photos, spotSlotsInside(props.photos.length, SPOT_PLAN))
    : props.photos,
)

const rows = computed(() => {
  const result: (IPublicPhoto | ISpotTile)[][] = []
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
        <template
          v-for="cell in rows[row.index]"
          :key="isSpotTile(cell) ? `ad-${cell.n}` : cell.id"
        >
          <HouseSpot
            v-if="isSpotTile(cell)"
            format="C"
            :seed="SPOT_SEED + cell.n"
            @unavailable="spotGone = true"
          />
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
