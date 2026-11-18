<script setup lang="ts">
import { ref, watch } from 'vue'

// One bought photo: its thumbnail (never the full file), or a placeholder with its name.
const props = withDefaults(
  defineProps<{
    thumbnailUrl: string | null
    filename: string
    canDownload: boolean
    busy: boolean
    /** The photo can be opened in full screen: its image becomes the button that does it. */
    canView?: boolean
  }>(),
  { canView: false },
)

const emit = defineEmits<{
  download: []
  view: []
}>()

const failed = ref(false)
watch(
  () => props.thumbnailUrl,
  () => (failed.value = false),
)
</script>

<template>
  <figure class="purchased-tile">
    <button
      v-if="thumbnailUrl && !failed && canView"
      type="button"
      class="purchased-tile__open"
      aria-label="Ver foto en grande"
      @click="emit('view')"
    >
      <img
        class="purchased-tile__image"
        :src="thumbnailUrl"
        alt="Foto comprada"
        loading="lazy"
        decoding="async"
        @error="failed = true"
      />
    </button>
    <img
      v-else-if="thumbnailUrl && !failed"
      class="purchased-tile__image"
      :src="thumbnailUrl"
      alt="Foto comprada"
      loading="lazy"
      decoding="async"
      @error="failed = true"
    />
    <figcaption v-else class="purchased-tile__placeholder">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16v12H4zM4 15l4-4 4 4 3-3 5 5M9 9.5h.01" />
      </svg>
      <span class="purchased-tile__name">{{ filename }}</span>
    </figcaption>

    <button
      v-if="canDownload"
      type="button"
      class="purchased-tile__download"
      aria-label="Descargar foto"
      :disabled="busy"
      :aria-busy="busy ? 'true' : undefined"
      @click="emit('download')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" :class="{ 'purchased-tile__spin': busy }">
        <path v-if="busy" d="M12 3a9 9 0 1 0 9 9" />
        <path v-else d="M12 4v11M7 10l5 5 5-5M5 20h14" />
      </svg>
    </button>
  </figure>
</template>

<style scoped>
.purchased-tile {
  position: relative;
  margin: 0;
  overflow: hidden;
  aspect-ratio: 3 / 4;
  border-radius: var(--tt-radius-m);
  background: var(--tt-surface-sunken);
  font-family: var(--tt-font-sans);
}

.purchased-tile__image {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
}

.purchased-tile__open {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: zoom-in;
}

.purchased-tile__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--tt-space-2);
  block-size: 100%;
  padding: var(--tt-space-2);
  color: var(--tt-ink-muted);
}

.purchased-tile svg {
  inline-size: var(--tt-icon-m);
  block-size: var(--tt-icon-m);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.purchased-tile__name {
  max-inline-size: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--tt-type-label-size);
}

.purchased-tile__download {
  position: absolute;
  inset-block-end: var(--tt-space-2);
  inset-inline-end: var(--tt-space-2);
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--tt-control-m);
  block-size: var(--tt-control-m);
  border: 0;
  border-radius: var(--tt-radius-pill);
  background: var(--tt-primary);
  color: var(--tt-on-primary);
  box-shadow: var(--tt-shadow-2);
  cursor: pointer;
}

.purchased-tile__download:disabled {
  cursor: progress;
}

.purchased-tile__spin {
  animation: purchased-tile-spin var(--tt-motion-emphasis) linear infinite;
}

@keyframes purchased-tile-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .purchased-tile__spin {
    animation: none;
  }
}
</style>
