<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'

import { hasScreenProblem } from '@/core/layout/client/screen-problem'
import { SPOT_RATIO, SPOTS_ENABLED, type SpotFormat } from '../../../spots-config'
import { PIECE_COPY } from '../../../pieces/piece-copy'
import { useSpotPieces } from '../../../composables/use-spot-pieces'
import { useNearScreen } from '../../../composables/use-near-screen'
import { useSpotDestination } from '../../../composables/use-spot-destination'
import { SPOTS_STARTED_AT, fillPiece, slideDelay } from '../../../utils/spot-rotation'
import { slideMessage } from '../../../utils/visible-slide'

const STYLES = ['topo', 'casco', 'textura', 'facetado'] as const

// A house ad: it keeps the shape of its format from the first paint and rotates four styles.
// The banners are decorative, so the moving part is hidden from screen readers and the keyboard;
// the whole piece is one link, to the page of the message on screen.
const props = defineProps<{
  /** 'AB': the 2:1 piece below 768 px, the 5:1 piece from there. */
  format: SpotFormat | 'AB'
  /** Placement: shifts the rotation and which slide speaks to organizers. */
  seed: number
}>()

const emit = defineEmits<{
  /** The banners could not be downloaded: whoever made room for the slot can take it back. */
  unavailable: []
}>()

const isWide = useMediaQuery('(min-width: 768px)')
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const format = computed<SpotFormat>(() =>
  props.format === 'AB' ? (isWide.value ? 'B' : 'A') : props.format,
)

// The format can change (turning the phone): each one keeps its own download.
const loaded = computed(() => useSpotPieces(format.value))
const root = ref<HTMLElement | null>(null)
const near = useNearScreen(root, SPOTS_ENABLED)

watch(
  [near, loaded],
  ([isNear, current]) => {
    if (SPOTS_ENABLED && isNear) current.load()
  },
  { immediate: true },
)

const slides = computed(() => {
  const file = loaded.value.piece.value
  if (!file) return []
  const now = Date.now()
  const all = STYLES.map((style, index) => {
    const message = slideMessage(index, props.seed)
    const html =
      (message === 'organizador' && file.organizer?.[style]) || file.styles?.[style] || ''
    return {
      style,
      html: fillPiece(html, {
        ...PIECE_COPY[format.value][message],
        maskUrl: file.maskUrl ?? '',
      }),
      delay: slideDelay(index, props.seed, SPOTS_STARTED_AT, now),
    }
  })
  return reducedMotion.value ? all.slice(0, 1) : all
})

const destination = useSpotDestination(root, {
  slideSelector: '.house-spot__slide',
  seed: () => props.seed,
  still: () => reducedMotion.value,
})

const hasDots = computed(
  () => (format.value === 'A' || format.value === 'B') && !reducedMotion.value,
)
// No house ad goes with a screen that shows a problem.
const isGone = computed(() => !SPOTS_ENABLED || loaded.value.failed.value || hasScreenProblem.value)
watch(
  () => loaded.value.failed.value,
  (failed) => {
    if (failed) emit('unavailable')
  },
)
</script>

<template>
  <div
    v-if="!isGone"
    ref="root"
    class="house-spot"
    :class="`house-spot--${format}`"
    role="region"
    aria-roledescription="carrusel"
    aria-label="Espacio publicitario"
  >
    <a
      class="house-spot__frame"
      :href="destination.href.value"
      :aria-label="destination.label.value"
      :style="{ aspectRatio: SPOT_RATIO[format] }"
      @click="destination.follow"
    >
      <div class="house-spot__slides" aria-hidden="true" inert>
        <!-- Generated banner files only (scripts/sync-house-pieces.mjs): never API or URL data. -->
        <span
          v-for="slide in slides"
          :key="slide.style"
          class="house-spot__slide"
          :class="{ 'house-spot__slide--still': reducedMotion }"
          :style="{ animationDelay: slide.delay }"
          v-html="slide.html"
        />
      </div>
    </a>
    <div v-if="hasDots" class="house-spot__dots" aria-hidden="true">
      <span
        v-for="(slide, index) in slides"
        :key="slide.style"
        class="house-spot__dot"
        :style="{ animationDelay: slides[index]?.delay }"
      />
    </div>
  </div>
</template>

<style scoped src="./house-spot.css" />
