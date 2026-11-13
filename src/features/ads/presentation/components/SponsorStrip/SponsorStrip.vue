<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'

import maskUrl from '@/assets/ads/helmet-mask.webp'
import { ADS_ENABLED } from '../../../ads-config'
import { useBannerFormat } from '../../../composables/use-banner-format'
import { useNearScreen } from '../../../composables/use-near-screen'
import { AD_STARTED_AT, fillBanner, slideDelay } from '../../../utils/ad-rotation'

const SLIDES = 4

// The "this event is presented by" strip of the gallery, for now with Titan's own pieces: a
// narrow strip on phones and a wide one from 768 px. Decorative, like every house ad.
const props = withDefaults(defineProps<{ seed?: number }>(), { seed: 2 })

const isWide = useMediaQuery('(min-width: 768px)')
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const loaded = computed(() => useBannerFormat(isWide.value ? 'sponsor-wide' : 'sponsor-narrow'))

const root = ref<HTMLElement | null>(null)
const near = useNearScreen(root, ADS_ENABLED)
watch(
  [near, loaded],
  ([isNear, current]) => {
    if (ADS_ENABLED && isNear) current.load()
  },
  { immediate: true },
)

// Generated banner file only: never API or URL data.
const html = computed(() => {
  const file = loaded.value.banner.value
  if (!file?.html) return ''
  const now = Date.now()
  const delays = Object.fromEntries(
    Array.from({ length: SLIDES }, (_, index) => [
      `d${index}`,
      slideDelay(index, props.seed, AD_STARTED_AT, now),
    ]),
  )
  return fillBanner(file.html, { ...delays, maskUrl })
})

const isGone = computed(() => !ADS_ENABLED || loaded.value.failed.value)
</script>

<template>
  <div
    v-if="!isGone"
    ref="root"
    class="sponsor-strip"
    :class="{ 'sponsor-strip--still': reducedMotion }"
  >
    <div
      class="sponsor-strip__frame"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Espacio publicitario"
    >
      <div class="sponsor-strip__content" aria-hidden="true" inert v-html="html" />
    </div>
  </div>
</template>

<style scoped src="./sponsor-strip.css" />
