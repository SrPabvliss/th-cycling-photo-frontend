<script setup lang="ts">
import { computed } from 'vue'

import PhotoViewerFrame, { type IViewerFramePhoto } from './PhotoViewerFrame.vue'

// The photos of a short list (an order, the cart) in full screen, one after another. Closed while
// no photo is picked; the footer says which one of how many is on screen.
const props = withDefaults(
  defineProps<{
    photos: IViewerFramePhoto[]
    /** The photo on screen; null keeps the viewer closed. */
    photoId: string | null
    label?: string
    /** See PhotoViewerFrame: for the organizer panel. */
    standalone?: boolean
  }>(),
  { label: 'Foto ampliada', standalone: false },
)

const emit = defineEmits<{
  'update:photoId': [photoId: string | null]
}>()

const position = computed(() => props.photos.findIndex((photo) => photo.id === props.photoId) + 1)
// The photo left the list while it was open (taken out of the cart): there is nothing to show.
const isOpen = computed(() => props.photoId !== null && position.value > 0)
</script>

<template>
  <PhotoViewerFrame
    v-if="isOpen && photoId"
    :photos="photos"
    :photo-id="photoId"
    :label="label"
    :standalone="standalone"
    @close="emit('update:photoId', null)"
    @update:photo-id="emit('update:photoId', $event)"
  >
    <template #footer>
      <span class="photo-list-viewer__count" data-test="viewer-count">
        {{ position }} de {{ photos.length }}
      </span>
      <slot name="actions" />
    </template>
  </PhotoViewerFrame>
</template>

<style scoped>
.photo-list-viewer__count {
  flex: 1;
  min-inline-size: 0;
  color: var(--tt-on-navy-muted);
  font-size: var(--tt-type-body-s-medium-size);
  font-variant-numeric: tabular-nums;
}
</style>
