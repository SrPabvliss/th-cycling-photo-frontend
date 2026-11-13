<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'

import maskUrl from '@/assets/ads/helmet-mask.webp'
import { ADS_ENABLED } from '../../../ads-config'
import { BANNER_COPY } from '../../../banners/banner-copy'
import { useBannerFormat } from '../../../composables/use-banner-format'
import { useNearScreen } from '../../../composables/use-near-screen'
import { AD_STARTED_AT, fillBanner, organizerSlide, slideDelay } from '../../../utils/ad-rotation'

const STYLES = ['topo', 'casco', 'textura', 'facetado'] as const

// The house season bar above the header: a narrow bar on phones and a wide one from 768 px. It
// keeps its height from the first paint and, like every house ad, is decorative.
const props = withDefaults(defineProps<{ seed?: number }>(), { seed: 13 })

const isWide = useMediaQuery('(min-width: 768px)')
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const loaded = computed(() => useBannerFormat(isWide.value ? 'season-wide' : 'season-narrow'))

const root = ref<HTMLElement | null>(null)
const near = useNearScreen(root, ADS_ENABLED)
watch(
  [near, loaded],
  ([isNear, current]) => {
    if (ADS_ENABLED && isNear) current.load()
  },
  { immediate: true },
)

// Generated banner files and the fixed copy only: never API or URL data.
const html = computed(() => {
  const file = loaded.value.banner.value
  if (!file?.frame) return ''
  const organizerAt = organizerSlide(props.seed)
  const now = Date.now()
  const slides = STYLES.map((style, index) => {
    const copy = BANNER_COPY.E[index === organizerAt ? 'organizador' : 'marca']
    const delay = slideDelay(index, props.seed, AD_STARTED_AT, now)
    const piece = fillBanner(file.styles?.[style] ?? '', { ...copy, maskUrl })
    return `<span class="season-bar__slide" style="animation-delay: ${delay}">${piece}</span>`
  })
  return fillBanner(file.frame, {
    slides: (reducedMotion.value ? slides.slice(0, 1) : slides).join(''),
  })
})

const isGone = computed(() => !ADS_ENABLED || loaded.value.failed.value)
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
