<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'

import { SPOTS_ENABLED } from '../../../spots-config'
import { PIECE_COPY } from '../../../pieces/piece-copy'
import { useSpotPieces } from '../../../composables/use-spot-pieces'
import { useNearScreen } from '../../../composables/use-near-screen'
import {
  SPOTS_STARTED_AT,
  fillPiece,
  organizerSlide,
  slideDelay,
} from '../../../utils/spot-rotation'

const STYLES = ['topo', 'casco', 'textura', 'facetado'] as const

// The house season bar above the header: a narrow bar on phones and a wide one from 768 px. It
// keeps its height from the first paint and, like every house ad, is decorative.
const props = withDefaults(defineProps<{ seed?: number }>(), { seed: 13 })

const isWide = useMediaQuery('(min-width: 768px)')
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const loaded = computed(() => useSpotPieces(isWide.value ? 'season-wide' : 'season-narrow'))

const root = ref<HTMLElement | null>(null)
const near = useNearScreen(root, SPOTS_ENABLED)
watch(
  [near, loaded],
  ([isNear, current]) => {
    if (SPOTS_ENABLED && isNear) current.load()
  },
  { immediate: true },
)

// Generated banner files and the fixed copy only: never API or URL data.
const html = computed(() => {
  const file = loaded.value.piece.value
  if (!file?.frame) return ''
  const organizerAt = organizerSlide(props.seed)
  const now = Date.now()
  const slides = STYLES.map((style, index) => {
    const copy = PIECE_COPY.E[index === organizerAt ? 'organizador' : 'marca']
    const delay = slideDelay(index, props.seed, SPOTS_STARTED_AT, now)
    const piece = fillPiece(file.styles?.[style] ?? '', { ...copy, maskUrl: file.maskUrl ?? '' })
    return `<span class="season-bar__slide" style="animation-delay: ${delay}">${piece}</span>`
  })
  return fillPiece(file.frame, {
    slides: (reducedMotion.value ? slides.slice(0, 1) : slides).join(''),
  })
})

const isGone = computed(() => !SPOTS_ENABLED || loaded.value.failed.value)
</script>

<template>
  <div v-if="!isGone" ref="root" class="season-bar" :class="{ 'season-bar--still': reducedMotion }">
    <div
      class="season-bar__frame"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Espacio publicitario"
    >
      <div class="season-bar__content" aria-hidden="true" inert v-html="html" />
    </div>
  </div>
</template>

<style scoped src="./season-bar.css" />
