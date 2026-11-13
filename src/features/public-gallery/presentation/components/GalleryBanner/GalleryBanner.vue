<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { eventDateParts } from '@/shared/public-events'
import { getAssetPresetUrl } from '@/shared/utils/cdn.utils'
import type { IPublicEventDetail } from '../../../types/responses/public-event-detail.response'
import { toCalendarDate } from '../../../utils/calendar-date'

const props = defineProps<{
  event: IPublicEventDetail
}>()

const router = useRouter()

const coverUrl = computed(() => {
  const asset =
    props.event.assets.find((each) => each.assetType === 'hero_image') ??
    props.event.assets.find((each) => each.assetType === 'cover_image')
  return asset ? getAssetPresetUrl(asset.publicSlug, 'cover-lg') : null
})
const coverFailed = ref(false)
watch(coverUrl, () => (coverFailed.value = false))

const eyebrow = computed(() => {
  const date = eventDateParts(
    toCalendarDate(props.event.startDate),
    toCalendarDate(props.event.endDate),
  )
  const place = [props.event.cantonName, props.event.provinceName].filter(Boolean).join(', ')
  return [`${date.day} ${date.month}`.trim(), place].filter(Boolean).join(' · ')
})

// Coming from the events list, going back returns to it as it was, with its search and filters.
function goBack() {
  const previous = router.options.history.state.back
  const cameFromList =
    typeof previous === 'string' && previous.split('?')[0] === ROUTE_PATHS.PUBLIC_GALLERY

  if (cameFromList) router.back()
  else router.push(ROUTE_PATHS.PUBLIC_GALLERY)
}
</script>

<template>
  <section class="gallery-banner">
    <img
      v-if="coverUrl && !coverFailed"
      class="gallery-banner__cover"
      :src="coverUrl"
      alt=""
      decoding="async"
      @error="coverFailed = true"
    />

    <button type="button" class="gallery-banner__back" aria-label="Volver" @click="goBack">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
    </button>

    <div class="gallery-banner__text">
      <span class="gallery-banner__eyebrow">{{ eyebrow }}</span>
      <h1 class="gallery-banner__title">{{ event.name }}</h1>
    </div>
  </section>
</template>

<style scoped>
/* Fixed height: the banner holds its room before the cover arrives. */
.gallery-banner {
  position: relative;
  flex: none;
  block-size: calc(var(--tt-ilu-page) - var(--tt-space-5) + var(--tt-space-1));
  overflow: hidden;
  background: var(--tt-navy);
  color: var(--tt-on-navy);
  font-family: var(--tt-font-sans);
}

.gallery-banner__cover {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
  object-position: center 40%;
}

.gallery-banner::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--tt-photo-overlay);
}

.gallery-banner__back {
  position: absolute;
  z-index: 1;
  inset-block-start: var(--tt-space-2);
  inset-inline-start: var(--tt-space-2);
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--tt-control-m);
  block-size: var(--tt-control-m);
  border: 0;
  border-radius: var(--tt-radius-pill);
  background: color-mix(in srgb, var(--tt-navy) 50%, transparent);
  color: var(--tt-on-navy);
  cursor: pointer;
}

.gallery-banner__back svg {
  inline-size: var(--tt-icon-l);
  block-size: var(--tt-icon-l);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.gallery-banner__text {
  position: absolute;
  z-index: 1;
  inset-inline: var(--tt-space-4);
  inset-block-end: var(--tt-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-1);
  max-inline-size: calc(var(--tt-container-max) - var(--tt-space-6));
  margin-inline: auto;
}

.gallery-banner__eyebrow {
  color: var(--tt-on-navy-eyebrow);
  font-size: var(--tt-type-eyebrow-size);
  line-height: var(--tt-type-eyebrow-line);
  font-weight: var(--tt-type-eyebrow-weight);
  letter-spacing: var(--tt-type-eyebrow-tracking);
  text-transform: uppercase;
}

.gallery-banner__title {
  margin: 0;
  font-family: var(--tt-type-display-m-family);
  font-stretch: var(--tt-display-stretch);
  font-size: var(--tt-type-display-m-size);
  line-height: var(--tt-type-display-m-line);
  font-weight: var(--tt-type-display-m-weight);
  text-transform: uppercase;
  text-wrap: balance;
}

@media (min-width: 768px) {
  .gallery-banner {
    block-size: calc(var(--tt-ilu-page) + var(--tt-space-8) - var(--tt-space-1));
  }

  .gallery-banner__text {
    inset-inline: var(--tt-space-6);
    inset-block-end: calc(var(--tt-space-5) + var(--tt-space-1));
  }

  .gallery-banner__title {
    font-size: var(--tt-type-display-l-size);
    line-height: var(--tt-type-display-l-line);
  }
}
</style>
