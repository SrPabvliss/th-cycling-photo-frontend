<script setup lang="ts">
import { computed, onMounted, onScopeDispose, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'

import maskUrl from '@/assets/ads/helmet-mask.webp'
import { AD_RATIO, ADS_ENABLED, type AdFormat } from '../../../ads-config'
import { BANNER_COPY } from '../../../banners/banner-copy'
import { useBannerFormat } from '../../../composables/use-banner-format'
import { AD_STARTED_AT, fillBanner, organizerSlide, slideDelay } from '../../../utils/ad-rotation'

const STYLES = ['topo', 'casco', 'textura', 'facetado'] as const
/** How near the screen a slot starts downloading its banners. */
const LOAD_MARGIN = '200px'

// A house ad: it keeps the shape of its format from the first paint and rotates four styles.
// The banners are decorative, so the moving part is hidden from screen readers and the keyboard.
const props = defineProps<{
  /** 'AB': the 2:1 piece below 768 px, the 5:1 piece from there. */
  format: AdFormat | 'AB'
  /** Placement: shifts the rotation and which slide speaks to organizers. */
  seed: number
}>()

const isWide = useMediaQuery('(min-width: 768px)')
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const format = computed<AdFormat>(() =>
  props.format === 'AB' ? (isWide.value ? 'B' : 'A') : props.format,
)

// The format can change (turning the phone): each one keeps its own download.
const loaded = computed(() => useBannerFormat(format.value))
const root = ref<HTMLElement | null>(null)
const near = ref(false)

watch(
  [near, loaded],
  ([isNear, current]) => {
    if (ADS_ENABLED && isNear) current.load()
  },
  { immediate: true },
)

let observer: IntersectionObserver | null = null
onMounted(() => {
  if (!ADS_ENABLED || !root.value) return
  if (typeof IntersectionObserver === 'undefined') {
    near.value = true
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        near.value = true
        observer?.disconnect()
      }
    },
    { rootMargin: LOAD_MARGIN },
  )
  observer.observe(root.value)
})
onScopeDispose(() => observer?.disconnect())

const slides = computed(() => {
  const file = loaded.value.banner.value
  if (!file) return []
  const organizerAt = organizerSlide(props.seed)
  const now = Date.now()
  const all = STYLES.map((style, index) => {
    const message = index === organizerAt ? 'organizador' : 'marca'
    const html = (message === 'organizador' && file.organizer?.[style]) || file.styles[style] || ''
    return {
      style,
      html: fillBanner(html, { ...BANNER_COPY[format.value][message], maskUrl }),
      delay: slideDelay(index, props.seed, AD_STARTED_AT, now),
    }
  })
  return reducedMotion.value ? all.slice(0, 1) : all
})

const hasDots = computed(
  () => (format.value === 'A' || format.value === 'B') && !reducedMotion.value,
)
const isGone = computed(() => !ADS_ENABLED || loaded.value.failed.value)
</script>

<template>
  <div v-if="!isGone" ref="root" class="ad-slot" :class="`ad-slot--${format}`">
    <div
      class="ad-slot__frame"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Espacio publicitario"
      :style="{ aspectRatio: AD_RATIO[format] }"
    >
      <div class="ad-slot__slides" aria-hidden="true" inert>
        <!-- Generated banner files only (scripts/sync-house-banners.mjs): never API or URL data. -->
        <span
          v-for="slide in slides"
          :key="slide.style"
          class="ad-slot__slide"
          :class="{ 'ad-slot__slide--still': reducedMotion }"
          :style="{ animationDelay: slide.delay }"
          v-html="slide.html"
        />
      </div>
    </div>
    <div v-if="hasDots" class="ad-slot__dots" aria-hidden="true">
      <span
        v-for="(slide, index) in slides"
        :key="slide.style"
        class="ad-slot__dot"
        :style="{ animationDelay: slides[index]?.delay }"
      />
    </div>
  </div>
</template>

<style scoped src="./ad-slot.css" />
