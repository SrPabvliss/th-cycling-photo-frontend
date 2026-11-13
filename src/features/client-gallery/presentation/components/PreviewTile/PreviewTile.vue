<script setup lang="ts">
import type { IPreviewPhoto } from '../../../types/responses/preview-data.response'

// Same shape as a gallery tile: the picture opens the photo, the box picks it.
defineProps<{
  photo: IPreviewPhoto
  selected: boolean
}>()

const emit = defineEmits<{
  open: [photoId: string]
  toggle: [photoId: string]
}>()
</script>

<template>
  <div class="preview-tile" :class="{ 'preview-tile--selected': selected }">
    <button
      type="button"
      class="preview-tile__open"
      aria-label="Ver foto"
      @click="emit('open', photo.id)"
    >
      <img :src="photo.url" alt="Foto con marca de agua" loading="lazy" decoding="async" />
    </button>
    <button
      type="button"
      class="preview-tile__toggle"
      :aria-pressed="selected ? 'true' : 'false'"
      :aria-label="selected ? 'Quitar foto' : 'Elegir foto'"
      @click="emit('toggle', photo.id)"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path v-if="selected" d="M5 12l4.5 4.5L19 7" />
        <path v-else d="M12 5v14M5 12h14" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.preview-tile {
  --tt-focus-ring: var(--tt-on-navy);
  position: relative;
  overflow: hidden;
  aspect-ratio: 3 / 4;
  border-radius: var(--tt-radius-m);
  background: var(--tt-surface-sunken);
}

.preview-tile--selected {
  box-shadow: 0 0 0 var(--tt-media-tile-ring) var(--tt-primary);
}

.preview-tile__open {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: zoom-in;
}

.preview-tile__open img {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
}

.preview-tile__toggle {
  position: absolute;
  inset-block-start: var(--tt-space-1);
  inset-inline-end: var(--tt-space-1);
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--tt-media-tile-toggle);
  block-size: var(--tt-media-tile-toggle);
  border: 0;
  border-radius: var(--tt-radius-pill);
  background: color-mix(in srgb, var(--tt-navy) 55%, transparent);
  color: var(--tt-on-navy);
  cursor: pointer;
}

.preview-tile--selected .preview-tile__toggle {
  background: var(--tt-primary);
  color: var(--tt-on-primary);
}

.preview-tile svg {
  inline-size: var(--tt-icon-m);
  block-size: var(--tt-icon-m);
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
