<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRef } from 'vue'

import { useDialogFocus } from '@/shared/composables/use-dialog-focus'
import { useViewerNavigation } from './use-viewer-navigation'

export interface IViewerFramePhoto {
  id: string
  src: string
  alt: string
}

// A photo in full screen and the way between photos, knowing nothing of carts or orders: what
// each screen offers about the photo goes in the footer.
const props = withDefaults(
  defineProps<{
    photos: IViewerFramePhoto[]
    photoId: string
    label: string
    hasNextPage?: boolean
    fetchNextPage?: () => Promise<unknown>
  }>(),
  { hasNextPage: false, fetchNextPage: async () => {} },
)

const emit = defineEmits<{
  close: []
  'update:photoId': [photoId: string]
}>()

const currentId = computed<string | null>({
  get: () => props.photoId,
  set: (id) => {
    if (id) emit('update:photoId', id)
  },
})

const { hasPrevious, hasNext, previous, next } = useViewerNavigation(
  toRef(props, 'photos'),
  currentId,
  { hasNextPage: toRef(props, 'hasNextPage'), fetchNextPage: () => props.fetchNextPage() },
)

const photo = computed(() => props.photos.find((each) => each.id === props.photoId) ?? null)

const panel = ref<HTMLElement | null>(null)
useDialogFocus(
  panel,
  () => true,
  () => emit('close'),
)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') void next()
  else if (event.key === 'ArrowLeft') previous()
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div
      ref="panel"
      class="photo-viewer"
      role="dialog"
      aria-modal="true"
      :aria-label="label"
      tabindex="-1"
    >
      <div class="photo-viewer__top">
        <button
          type="button"
          class="photo-viewer__round"
          aria-label="Cerrar"
          @click="emit('close')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <slot name="badge" />
        <span class="photo-viewer__spacer" aria-hidden="true" />
      </div>

      <div class="photo-viewer__stage">
        <img
          v-if="photo"
          :key="photo.id"
          class="photo-viewer__photo"
          :src="photo.src"
          :alt="photo.alt"
          decoding="async"
        />

        <button
          type="button"
          class="photo-viewer__round photo-viewer__nav photo-viewer__nav--previous"
          aria-label="Foto anterior"
          :disabled="!hasPrevious"
          @click="previous"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <button
          type="button"
          class="photo-viewer__round photo-viewer__nav photo-viewer__nav--next"
          aria-label="Foto siguiente"
          :disabled="!hasNext"
          @click="next"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>

      <div class="photo-viewer__bottom">
        <div class="photo-viewer__bar">
          <slot name="footer" />
        </div>
        <!-- Optional: what a screen puts under the footer (the gallery's house ad). -->
        <slot name="after" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Always dark, whatever the scheme: a photo is looked at against a dark room. */
.photo-viewer {
  --tt-focus-ring: var(--tt-on-navy);
  position: fixed;
  inset: 0;
  z-index: var(--tt-layer-viewer);
  display: flex;
  flex-direction: column;
  outline: none;
  background: color-mix(in srgb, var(--tt-navy) 45%, black);
  color: var(--tt-on-navy);
  font-family: var(--tt-font-sans);
}

.photo-viewer__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--tt-space-2);
}

.photo-viewer__spacer {
  inline-size: var(--tt-control-m);
}

.photo-viewer__round {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--tt-control-m);
  block-size: var(--tt-control-m);
  border: 0;
  border-radius: var(--tt-radius-pill);
  background: transparent;
  color: var(--tt-on-navy);
  cursor: pointer;
}

.photo-viewer__round svg {
  inline-size: var(--tt-icon-l);
  block-size: var(--tt-icon-l);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.photo-viewer__stage {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-block-size: 0;
}

.photo-viewer__photo {
  max-inline-size: 100%;
  max-block-size: 100%;
  object-fit: contain;
}

.photo-viewer__nav {
  position: absolute;
  inset-block-start: calc(50% - var(--tt-control-m) / 2);
  background: color-mix(in srgb, var(--tt-on-navy) 14%, transparent);
}

.photo-viewer__nav--previous {
  inset-inline-start: var(--tt-space-2);
}

.photo-viewer__nav--next {
  inset-inline-end: var(--tt-space-2);
}

.photo-viewer__nav:disabled {
  opacity: 0.35;
  cursor: default;
}

.photo-viewer__bottom {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-3);
  padding: var(--tt-space-3) var(--tt-space-4) calc(var(--tt-space-3) + env(safe-area-inset-bottom));
}

.photo-viewer__bar {
  display: flex;
  align-items: center;
  gap: var(--tt-space-3);
}
</style>
