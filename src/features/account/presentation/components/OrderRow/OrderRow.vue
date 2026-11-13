<script setup lang="ts">
import { computed, ref } from 'vue'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { formatMoney } from '@/shared/pricing/tier-cards'
import { formatDate } from '@/shared/utils/date.utils'
import { ORDER_STATE_PILL } from '../../../constants/order-state-pill'
import type { IMyOrderListItem } from '../../../types/responses/my-order.response'
import OrderStatePill from '../OrderStatePill/OrderStatePill.vue'

const PREVIEW_COUNT = 2

const props = defineProps<{
  order: IMyOrderListItem
}>()

// The list brings the gallery image (watermarked) of each photo: enough to recognise the order.
const failed = ref(new Set<string>())
const previews = computed(() =>
  Array.from({ length: PREVIEW_COUNT }, (_, index) => {
    const photo = props.order.previewPhotos[index]
    return photo && !failed.value.has(photo.photoId) ? photo : null
  }),
)
function onError(photoId: string) {
  failed.value = new Set(failed.value).add(photoId)
}

const photos = computed(() =>
  props.order.photoCount === 1 ? '1 foto' : `${props.order.photoCount} fotos`,
)
const amount = computed(() => {
  if (props.order.state === 'gifted') return 'Gratis'
  if (props.order.subtotal == null || !props.order.currency) return null
  return formatMoney(Number(props.order.subtotal), props.order.currency)
})
const line = computed(() =>
  [formatDate(new Date(props.order.createdAt)), photos.value, amount.value]
    .filter(Boolean)
    .join(' · '),
)
const label = computed(
  () => `${props.order.eventName}, ${ORDER_STATE_PILL[props.order.state].text}, ${photos.value}`,
)
</script>

<template>
  <RouterLink
    class="order-row"
    :to="`${ROUTE_PATHS.ACCOUNT}/orders/${order.id}`"
    :aria-label="label"
  >
    <span class="order-row__previews" aria-hidden="true">
      <template v-for="(photo, index) in previews" :key="index">
        <img
          v-if="photo"
          class="order-row__preview"
          :src="photo.galleryUrl"
          alt=""
          loading="lazy"
          decoding="async"
          @error="onError(photo.photoId)"
        />
        <span v-else class="order-row__preview order-row__placeholder">
          <svg viewBox="0 0 24 24"><path d="M4 6h16v12H4zM4 15l4-4 4 4 3-3 5 5M9 9.5h.01" /></svg>
        </span>
      </template>
    </span>
    <span class="order-row__body">
      <strong class="order-row__event">{{ order.eventName }}</strong>
      <span class="order-row__line">{{ line }}</span>
      <OrderStatePill :state="order.state" />
    </span>
    <svg class="order-row__chevron" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  </RouterLink>
</template>

<style scoped>
.order-row {
  display: flex;
  align-items: center;
  gap: var(--tt-space-3);
  padding: var(--tt-space-3);
  border-radius: var(--tt-radius-l);
  background: var(--tt-surface-raised);
  box-shadow: var(--tt-card-edge), var(--tt-shadow-2);
  color: var(--tt-ink);
  text-decoration: none;
  font-family: var(--tt-font-sans);
}

.order-row:hover {
  box-shadow: var(--tt-card-edge), var(--tt-shadow-card-hover);
}

.order-row:focus-visible {
  outline: medium solid var(--tt-primary);
  outline-offset: calc(var(--tt-space-1) / 2);
}

.order-row__previews {
  flex: none;
  display: grid;
  grid-template-columns: repeat(2, calc(var(--tt-control-m) - var(--tt-space-1) / 2));
  gap: var(--tt-space-1);
}

.order-row__preview {
  display: block;
  inline-size: 100%;
  aspect-ratio: 3 / 4;
  border-radius: var(--tt-radius-s);
  object-fit: cover;
}

.order-row__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tt-surface-sunken);
  color: var(--tt-ink-muted);
}

.order-row svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.order-row__placeholder svg {
  inline-size: var(--tt-icon-m);
  block-size: var(--tt-icon-m);
}

.order-row__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(var(--tt-space-1) / 2);
  min-inline-size: 0;
}

.order-row__event {
  max-inline-size: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-row__line {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
}

.order-row__chevron {
  flex: none;
  inline-size: var(--tt-icon-m);
  block-size: var(--tt-icon-m);
  color: var(--tt-ink-muted);
}
</style>
