<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRef, watch } from 'vue'

import { useDialogFocus } from '@/shared/composables/use-dialog-focus'
import { useFocusHandOff } from '@/shared/composables/use-focus-hand-off'
import { useViewerNavigation } from './use-viewer-navigation'
import { useViewerSwipe } from './use-viewer-swipe'
import { useViewerZoom } from './use-viewer-zoom'

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
    /**
     * Opened from the organizer panel, which has none of the client tokens this viewer is drawn
     * with: it brings its own.
     */
    standalone?: boolean
  }>(),
  { hasNextPage: false, fetchNextPage: async () => {}, standalone: false },
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

const navigation = useViewerNavigation(toRef(props, 'photos'), currentId, {
  hasNextPage: toRef(props, 'hasNextPage'),
  fetchNextPage: () => props.fetchNextPage(),
})
const { hasPrevious, hasNext } = navigation

// The side the new photo comes in from, so a change reads as a movement and not as a blink.
const cameFrom = ref<'next' | 'previous' | null>(null)
function previous() {
  cameFrom.value = 'previous'
  navigation.previous()
}
function next() {
  cameFrom.value = 'next'
  return navigation.next()
}

const stage = ref<HTMLElement | null>(null)
// Zoomed in, a finger moves around the photo; back at its size, it moves on to the next one.
const zoom = useViewerZoom(stage)
const swipe = useViewerSwipe(stage, {
  canPrevious: () => hasPrevious.value,
  canNext: () => hasNext.value,
  onPrevious: previous,
  onNext: () => void next(),
  isZoomed: () => zoom.isZoomed.value || (window.visualViewport?.scale ?? 1) > 1.01,
})
// Every photo starts at its own size.
watch(() => props.photoId, zoom.reset)

const photoStyle = computed(() => {
  const x = zoom.x.value + swipe.offset.value
  const y = zoom.y.value
  if (!x && !y && !zoom.isZoomed.value) return undefined
  return { transform: `translate(${x}px, ${y}px) scale(${zoom.scale.value})` }
})

const photo = computed(() => props.photos.find((each) => each.id === props.photoId) ?? null)

const panel = ref<HTMLElement | null>(null)
// An arrow that reaches the end turns off: the focus goes to the other one.
const previousButton = ref<HTMLButtonElement | null>(null)
const nextButton = ref<HTMLButtonElement | null>(null)
useFocusHandOff(
  () => hasPrevious.value,
  () => previousButton.value,
  () => nextButton.value,
)
useFocusHandOff(
  () => hasNext.value,
  () => nextButton.value,
  () => previousButton.value,
)
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
      :data-tt-area="standalone ? 'client' : undefined"
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

      <div ref="stage" class="photo-viewer__stage">
        <img
          v-if="photo"
          :key="photo.id"
          class="photo-viewer__photo"
          :class="{
            'photo-viewer__photo--dragging': swipe.isDragging.value || zoom.isGesturing.value,
            'photo-viewer__photo--zoomed': zoom.isZoomed.value,
            'photo-viewer__photo--from-next': cameFrom === 'next',
            'photo-viewer__photo--from-previous': cameFrom === 'previous',
          }"
          :style="photoStyle"
          draggable="false"
          :src="photo.src"
          :alt="photo.alt"
          decoding="async"
        />

        <button
          ref="previousButton"
          type="button"
          class="photo-viewer__round photo-viewer__nav photo-viewer__nav--previous"
          aria-label="Foto anterior"
          :disabled="!hasPrevious"
          @click="previous"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <button
          ref="nextButton"
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
  overflow: hidden;
  /* Every gesture over the photo is the viewer's: swipe to change it, pinch and double tap to
     zoom into it. The page behind neither scrolls nor zooms. */
  touch-action: none;
}

.photo-viewer__photo {
  max-inline-size: 100%;
  max-block-size: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
  /* Let go short of the mark, the photo goes back to its place. */
  transition: transform 0.2s ease-out;
}

.photo-viewer__photo--dragging {
  transition: none;
}

.photo-viewer__photo--zoomed {
  cursor: grab;
}

.photo-viewer__photo--from-next {
  animation: photo-viewer-from-next 0.2s ease-out;
}

.photo-viewer__photo--from-previous {
  animation: photo-viewer-from-previous 0.2s ease-out;
}

@keyframes photo-viewer-from-next {
  from {
    transform: translateX(12%);
    opacity: 0.4;
  }
}

@keyframes photo-viewer-from-previous {
  from {
    transform: translateX(-12%);
    opacity: 0.4;
  }
}

@media (prefers-reduced-motion: reduce) {
  .photo-viewer__photo,
  .photo-viewer__photo--from-next,
  .photo-viewer__photo--from-previous {
    transition: none;
    animation: none;
  }
}

/* Over a photo of any colour: a dark disc with a light rim, so the arrow never gets lost. */
.photo-viewer__nav {
  position: absolute;
  inset-block-start: calc(50% - var(--tt-control-m) / 2);
  background: color-mix(in srgb, black 55%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--tt-on-navy) 45%, transparent);
}

.photo-viewer__nav svg {
  stroke-width: 2.4;
}

.photo-viewer__nav--previous {
  inset-inline-start: var(--tt-space-2);
}

.photo-viewer__nav--next {
  inset-inline-end: var(--tt-space-2);
}

/* At the first or the last photo there is nowhere to go: the arrow steps back. */
.photo-viewer__nav:disabled {
  opacity: 0.3;
  cursor: default;
}

.photo-viewer__bottom {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-3);
  padding: var(--tt-space-3) var(--tt-space-4);
}

.photo-viewer__bar {
  display: flex;
  align-items: center;
  gap: var(--tt-space-3);
}
</style>
