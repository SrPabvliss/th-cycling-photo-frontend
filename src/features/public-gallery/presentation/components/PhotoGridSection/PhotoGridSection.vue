<script setup lang="ts">
import { computed, ref, toRef } from 'vue'

import HouseSpot from '@/features/house-spots/presentation/components/HouseSpot/HouseSpot.vue'
import { SPOTS_ENABLED } from '@/features/house-spots/spots-config'
import {
  isSpotTile,
  spotSlots,
  spotSlotsInside,
  withSpotTiles,
  type ISpotTile,
} from '@/features/house-spots/utils/spot-placement'
import { TtSkeleton } from '@/shared/components/loading'
import { useInfiniteScrollTrigger } from '@/shared/composables/use-infinite-scroll-trigger'
import type { IPublicPhoto } from '../../../types/responses/public-photo.response'
import PhotoTile from '../PhotoTile/PhotoTile.vue'

const LOADING_MORE_PLACEHOLDERS = 3
// The gallery's rhythm: before the 8th photo, 18 photos further down, then one every 30.
const SPOT_PLAN = { first: 7, second: 18, every: 30 }

const props = withDefaults(
  defineProps<{
    photos: IPublicPhoto[]
    selectedIds: Set<string>
    busyIds: Set<string>
    /** Plate these photos were found by; drawn on every tile. */
    plate?: string | null
    hasMore?: boolean
    isLoadingMore?: boolean
    /** House ad tiles among the photos, at the gallery's rhythm. */
    withSpot?: boolean
    /** A tile may close the list: a shorter one gets its tile after the last photo. */
    spotAtEnd?: boolean
    /** Seed of the first tile; each next one takes the next number. */
    spotSeed?: number
  }>(),
  {
    plate: null,
    hasMore: false,
    isLoadingMore: false,
    withSpot: false,
    spotAtEnd: false,
    spotSeed: 0,
  },
)

const emit = defineEmits<{
  open: [photoId: string]
  toggle: [photoId: string]
  loadMore: []
}>()

// The tiles are cells like the photos, 3:4 too. If their pieces cannot be shown, every one goes.
const spotGone = ref(false)
const cells = computed<(IPublicPhoto | ISpotTile)[]>(() => {
  if (!props.withSpot || !SPOTS_ENABLED || spotGone.value) return props.photos
  const length = props.photos.length
  const slots = props.spotAtEnd ? spotSlots(length, SPOT_PLAN) : spotSlotsInside(length, SPOT_PLAN)
  return withSpotTiles(props.photos, slots)
})

// Plain grid, no virtualizer: the results of a plate search and the photos with no plate are
// short lists, and two of them share the page one under the other.
const sentinel = useInfiniteScrollTrigger(() => emit('loadMore'), {
  isBusy: toRef(props, 'isLoadingMore'),
  canLoadMore: computed(() => props.hasMore),
})
</script>

<template>
  <div class="photo-grid-section">
    <div class="photo-grid">
      <template v-for="cell in cells" :key="isSpotTile(cell) ? `ad-${cell.n}` : cell.id">
        <HouseSpot
          v-if="isSpotTile(cell)"
          format="C"
          :seed="spotSeed + cell.n"
          @unavailable="spotGone = true"
        />
        <PhotoTile
          v-else
          :photo="cell"
          :selected="selectedIds.has(cell.id)"
          :busy="busyIds.has(cell.id)"
          :plate="plate"
          @open="emit('open', $event)"
          @toggle="emit('toggle', $event)"
        />
      </template>
      <template v-if="isLoadingMore">
        <TtSkeleton
          v-for="n in LOADING_MORE_PLACEHOLDERS"
          :key="`more-${n}`"
          class="photo-grid__placeholder"
          height="auto"
          radius="m"
        />
      </template>
    </div>

    <div v-if="hasMore" ref="sentinel" aria-hidden="true" />
  </div>
</template>

<style scoped src="../photo-grid.css" />
