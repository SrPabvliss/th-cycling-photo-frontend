<script setup lang="ts">
import { computed, toRef } from 'vue'

import { TtSkeleton } from '@/shared/components/loading'
import { useInfiniteScrollTrigger } from '@/shared/composables/use-infinite-scroll-trigger'
import type { IPublicPhoto } from '../../../types/responses/public-photo.response'
import PhotoTile from '../PhotoTile/PhotoTile.vue'

const LOADING_MORE_PLACEHOLDERS = 3

const props = withDefaults(
  defineProps<{
    photos: IPublicPhoto[]
    selectedIds: Set<string>
    busyIds: Set<string>
    /** Plate these photos were found by; drawn on every tile. */
    plate?: string | null
    hasMore?: boolean
    isLoadingMore?: boolean
  }>(),
  { plate: null, hasMore: false, isLoadingMore: false },
)

const emit = defineEmits<{
  open: [photoId: string]
  toggle: [photoId: string]
  loadMore: []
}>()

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
      <PhotoTile
        v-for="photo in photos"
        :key="photo.id"
        :photo="photo"
        :selected="selectedIds.has(photo.id)"
        :busy="busyIds.has(photo.id)"
        :plate="plate"
        @open="emit('open', $event)"
        @toggle="emit('toggle', $event)"
      />
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
