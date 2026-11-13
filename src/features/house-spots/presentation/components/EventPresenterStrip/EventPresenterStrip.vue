<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'

import { hasScreenProblem } from '@/core/layout/client/screen-problem'
import { SPOTS_ENABLED } from '../../../spots-config'
import { useSpotPieces } from '../../../composables/use-spot-pieces'
import { useNearScreen } from '../../../composables/use-near-screen'
import { SPOTS_STARTED_AT, fillPiece, slideDelay } from '../../../utils/spot-rotation'

const SLIDES = 4

// The "this event is presented by" strip of the gallery, for now with Titan's own pieces: a
// narrow strip on phones and a wide one from 768 px. Decorative, like every house ad.
const props = withDefaults(defineProps<{ seed?: number }>(), { seed: 2 })

const isWide = useMediaQuery('(min-width: 768px)')
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const loaded = computed(() => useSpotPieces(isWide.value ? 'presenter-wide' : 'presenter-narrow'))

const root = ref<HTMLElement | null>(null)
const near = useNearScreen(root, SPOTS_ENABLED)
watch(
  [near, loaded],
  ([isNear, current]) => {
    if (SPOTS_ENABLED && isNear) current.load()
  },
  { immediate: true },
)

// Generated banner file only: never API or URL data.
const html = computed(() => {
  const file = loaded.value.piece.value
  if (!file?.html) return ''
  const now = Date.now()
  const delays = Object.fromEntries(
    Array.from({ length: SLIDES }, (_, index) => [
      `d${index}`,
      slideDelay(index, props.seed, SPOTS_STARTED_AT, now),
    ]),
  )
  return fillPiece(file.html, { ...delays, maskUrl: file.maskUrl ?? '' })
})

// No house ad goes with a screen that shows a problem.
const isGone = computed(() => !SPOTS_ENABLED || loaded.value.failed.value || hasScreenProblem.value)
</script>

<template>
  <div
    v-if="!isGone"
    ref="root"
    class="presenter-strip"
    :class="{ 'presenter-strip--still': reducedMotion }"
  >
    <div
      class="presenter-strip__frame"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Espacio publicitario"
    >
      <div class="presenter-strip__content" aria-hidden="true" inert v-html="html" />
    </div>
  </div>
</template>

<style scoped src="./presenter-strip.css" />
