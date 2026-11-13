<script setup lang="ts">
import { computed } from 'vue'

import { getGalleryUrl } from '@/shared/utils/cdn.utils'
import type { IPublicPhoto } from '../../../types/responses/public-photo.response'

const props = withDefaults(
  defineProps<{
    photo: IPublicPhoto
    /** In the cart. */
    selected: boolean
    /** A change of this photo is still on its way to the server. */
    busy: boolean
    /**
     * Plate this photo was found by. The api does not say which plate is on a photo, so there is
     * one to show only in the results of a plate search.
     */
    plate?: string | null
  }>(),
  { plate: null },
)

const emit = defineEmits<{
  open: [photoId: string]
  toggle: [photoId: string]
}>()

const openLabel = computed(() => (props.plate ? `Ver foto, placa ${props.plate}` : 'Ver foto'))
const altText = computed(() =>
  props.plate ? `Foto de la placa ${props.plate}` : 'Foto del evento',
)
</script>

<template>
  <div class="photo-tile" :class="{ 'photo-tile--selected': selected }">
    <button
      type="button"
      class="photo-tile__open"
      :aria-label="openLabel"
      @click="emit('open', photo.id)"
    >
      <img :src="getGalleryUrl(photo.publicSlug)" :alt="altText" loading="lazy" decoding="async" />
    </button>

    <span v-if="plate" class="photo-tile__plate">#{{ plate }}</span>

    <!-- Never disabled: taps are queued, and the last one decides (see use-cart-actions.ts). -->
    <button
      type="button"
      class="photo-tile__toggle"
      :aria-pressed="selected ? 'true' : 'false'"
      :aria-label="selected ? 'Quitar del carrito' : 'Agregar al carrito'"
      :aria-busy="busy ? 'true' : undefined"
      @click="emit('toggle', photo.id)"
    >
      <svg class="photo-tile__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path v-if="selected" d="M5 12l4.5 4.5L19 7" />
        <path v-else d="M12 5v14M5 12h14" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* 3:4, reserved before the image arrives. */
.photo-tile {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: var(--tt-radius-m);
  background: var(--tt-surface-sunken);
}

.photo-tile--selected {
  box-shadow: 0 0 0 var(--tt-media-tile-ring) var(--tt-primary);
}

.photo-tile__open {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: zoom-in;
}

.photo-tile__open img {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
}

.photo-tile__plate {
  position: absolute;
  inset-inline-start: var(--tt-space-1);
  inset-block-end: var(--tt-space-1);
  padding: calc(var(--tt-space-1) / 2) var(--tt-space-2);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  font-family: var(--tt-font-sans);
  font-size: var(--tt-type-label-size);
  line-height: var(--tt-type-label-line);
  font-weight: var(--tt-type-label-weight);
  pointer-events: none;
}

.photo-tile__toggle {
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

.photo-tile--selected .photo-tile__toggle {
  background: var(--tt-primary);
  color: var(--tt-on-primary);
}

.photo-tile__icon {
  inline-size: var(--tt-icon-m);
  block-size: var(--tt-icon-m);
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
