<script setup lang="ts">
import { computed } from 'vue'

import PhotoViewerFrame from '@/shared/photo-viewer/PhotoViewerFrame.vue'
import type { IPhotoSelection } from '../../../composables/use-photo-selection'
import type { IPreviewPhoto } from '../../../types/responses/preview-data.response'

// A preview photo in full screen. No address of its own: closing goes back to the grid.
const props = defineProps<{
  photos: IPreviewPhoto[]
  photoId: string
  selection: IPhotoSelection
}>()

const emit = defineEmits<{
  close: []
  'update:photoId': [photoId: string]
}>()

const framePhotos = computed(() =>
  props.photos.map((photo) => ({ id: photo.id, src: photo.url, alt: 'Foto con marca de agua' })),
)
const isChosen = computed(() => props.selection.isSelected(props.photoId))
const isBought = computed(
  () => props.photos.find((photo) => photo.id === props.photoId)?.alreadyPurchased === true,
)
</script>

<template>
  <PhotoViewerFrame
    :photos="framePhotos"
    :photo-id="photoId"
    label="Foto ampliada"
    @close="emit('close')"
    @update:photo-id="emit('update:photoId', $event)"
  >
    <template #footer>
      <span v-if="isBought" class="preview-viewer__note">
        Ya la compraste. La encuentras en Mis fotos.
      </span>
      <span v-else class="preview-viewer__note">La marca de agua desaparece al comprar.</span>
      <button
        v-if="!isBought"
        type="button"
        class="preview-viewer__toggle"
        :class="{ 'preview-viewer__toggle--remove': isChosen }"
        :aria-pressed="isChosen ? 'true' : 'false'"
        @click="selection.toggle(photoId)"
      >
        {{ isChosen ? 'Quitar foto' : 'Elegir foto' }}
      </button>
    </template>
  </PhotoViewerFrame>
</template>

<style scoped>
.preview-viewer__note {
  flex: 1;
  min-inline-size: 0;
  color: var(--tt-on-navy-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
}

.preview-viewer__toggle {
  flex: none;
  block-size: var(--tt-control-m);
  padding-inline: calc(var(--tt-space-4) + var(--tt-space-1));
  border: 0;
  border-radius: var(--tt-radius-m);
  background: var(--tt-primary);
  color: var(--tt-on-primary);
  font-family: inherit;
  font-size: var(--tt-type-body-s-medium-size);
  font-weight: var(--tt-type-title-weight);
  white-space: nowrap;
  cursor: pointer;
}

.preview-viewer__toggle--remove {
  background: color-mix(in srgb, var(--tt-on-navy) 14%, transparent);
  color: var(--tt-on-navy);
}
</style>
