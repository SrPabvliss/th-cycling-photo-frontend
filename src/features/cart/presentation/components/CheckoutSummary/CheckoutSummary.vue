<script setup lang="ts">
import { computed, ref } from 'vue'

import { usePriceSheet } from '@/features/pricing/composables/use-price-sheet'
import { useCartActions } from '@/shared/cart'
import { quotePhotos, sortTiers } from '@/shared/pricing/quote'
import { formatMoney } from '@/shared/pricing/tier-cards'
import { nextTierText } from '@/shared/pricing/tier-text'
import { usePricingTiersQuery } from '@/shared/pricing/use-pricing-tiers'
import PhotoListViewer from '@/shared/photo-viewer/PhotoListViewer.vue'
import type { ICartGroup } from '@/shared/types/cart.types'
import { getGalleryUrl } from '@/shared/utils/cdn.utils'

// What the order of one event holds and costs. Photos are taken out right here, at once; the
// price updates in place, worked out from the tiers.
const props = defineProps<{
  group: ICartGroup
}>()

const cartActions = useCartActions()
const priceSheet = usePriceSheet()
const { data: pricing } = usePricingTiersQuery()

const count = computed(() => props.group.photos.length)

// A photo of the order opens in full screen, and swiping goes through the rest of the order.
const viewingId = ref<string | null>(null)
const viewerPhotos = computed(() =>
  props.group.photos.map((photo) => ({
    id: photo.id,
    src: getGalleryUrl(photo.publicSlug),
    alt: 'Foto del pedido',
  })),
)
const quote = computed(() => (pricing.value ? quotePhotos(pricing.value.tiers, count.value) : null))
const money = (amount: number) => formatMoney(amount, pricing.value?.currency ?? '')

// The first tier is the full price: shown struck through next to a lower one.
const basePrice = computed(() => sortTiers(pricing.value?.tiers ?? [])[0]?.pricePerPhoto ?? null)
const nextTier = computed(() =>
  quote.value && pricing.value ? nextTierText(quote.value, pricing.value.currency) : null,
)
</script>

<template>
  <div class="order-summary">
    <ul class="order-summary__thumbs">
      <li
        v-for="photo in group.photos"
        :key="photo.id"
        class="order-summary__thumb"
        :class="{ 'order-summary__thumb--bought': photo.alreadyPurchased }"
      >
        <button
          type="button"
          class="order-summary__open"
          aria-label="Ver foto en grande"
          @click="viewingId = photo.id"
        >
          <img
            :src="getGalleryUrl(photo.publicSlug)"
            alt="Foto del pedido"
            loading="lazy"
            decoding="async"
          />
        </button>
        <span v-if="photo.alreadyPurchased" class="order-summary__bought">Ya la compraste</span>
        <button
          type="button"
          class="order-summary__remove"
          aria-label="Quitar foto"
          @click="cartActions.remove(photo.id)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </li>
      <li>
        <RouterLink class="order-summary__add" :to="`/gallery/${group.eventSlug}`">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          Agregar
        </RouterLink>
      </li>
    </ul>

    <PhotoListViewer v-model:photo-id="viewingId" :photos="viewerPhotos" />

    <p v-if="nextTier" class="order-summary__nudge">
      {{ nextTier }}.
      <button type="button" class="order-summary__link" @click="priceSheet.open(count)">
        Cómo funcionan los precios
      </button>
    </p>

    <!-- Stays mounted while the quantity changes: the figures update in place. -->
    <div v-if="quote" class="order-summary__price">
      <div class="order-summary__row">
        <span class="order-summary__muted">Precio por foto</span>
        <span class="order-summary__unit">
          <template v-if="basePrice !== null && quote.unitPrice < basePrice">
            <s class="order-summary__muted">{{ money(basePrice) }}</s
            >{{ ' ' }}
          </template>
          <strong>{{ money(quote.unitPrice) }}</strong> c/u
        </span>
      </div>
      <div class="order-summary__row">
        <span class="order-summary__muted">
          Total · {{ count }} {{ count === 1 ? 'foto' : 'fotos' }}
        </span>
        <span class="order-summary__total">{{ money(quote.total) }}</span>
      </div>
    </div>
    <p v-else class="order-summary__muted">{{ count }} {{ count === 1 ? 'foto' : 'fotos' }}</p>
  </div>
</template>

<style scoped>
.order-summary {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-4);
  font-family: var(--tt-font-sans);
}

.order-summary__thumbs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--tt-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.order-summary__thumb {
  position: relative;
}

/* The photo itself opens it in full screen. */
.order-summary__open {
  display: block;
  inline-size: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: zoom-in;
}

.order-summary__thumb img,
.order-summary__add {
  display: block;
  inline-size: 100%;
  aspect-ratio: 3 / 4;
  border-radius: var(--tt-radius-m);
}

.order-summary__thumb img {
  object-fit: cover;
}

/* A photo of an earlier order: dimmed, with a label along its foot, still with its "Quitar". */
.order-summary__thumb--bought img {
  opacity: 0.55;
}

.order-summary__bought {
  position: absolute;
  inset-inline: calc(var(--tt-space-1) / 2);
  inset-block-end: calc(var(--tt-space-1) / 2);
  padding: calc(var(--tt-space-1) / 2) var(--tt-space-1);
  border-radius: var(--tt-radius-s);
  background: var(--tt-danger-soft);
  color: var(--tt-danger-ink);
  font-size: var(--tt-type-label-size);
  line-height: var(--tt-type-label-line);
  font-weight: var(--tt-type-label-weight);
  text-align: center;
}

.order-summary__remove {
  position: absolute;
  inset-block-start: calc(var(--tt-space-1) / 2);
  inset-inline-end: calc(var(--tt-space-1) / 2);
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: calc(var(--tt-space-6) - var(--tt-space-1));
  block-size: calc(var(--tt-space-6) - var(--tt-space-1));
  border: 0;
  border-radius: var(--tt-radius-pill);
  background: color-mix(in srgb, var(--tt-navy) 60%, transparent);
  color: var(--tt-on-navy);
  cursor: pointer;
}

.order-summary svg {
  inline-size: var(--tt-icon-s);
  block-size: var(--tt-icon-s);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
}

.order-summary__add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--tt-space-1);
  border: medium dashed var(--tt-primary-soft-border);
  background: var(--tt-surface-sunken);
  color: var(--tt-primary-ink);
  text-decoration: none;
  font-size: var(--tt-type-label-size);
  font-weight: var(--tt-type-label-weight);
}

.order-summary__nudge {
  margin: 0;
  padding: var(--tt-space-3) var(--tt-space-4);
  border-radius: var(--tt-radius-m);
  background: var(--tt-primary-soft);
  color: var(--tt-ink);
  font-size: var(--tt-type-body-s-size);
  line-height: var(--tt-type-body-s-line);
}

.order-summary__link {
  padding: 0;
  border: 0;
  background: none;
  color: var(--tt-primary-ink);
  font: inherit;
  font-weight: var(--tt-type-title-weight);
  cursor: pointer;
}

.order-summary__price {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-1);
}

.order-summary__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--tt-space-3);
  font-size: var(--tt-type-body-size);
  line-height: var(--tt-type-body-line);
}

.order-summary__muted {
  margin: 0;
  color: var(--tt-ink-muted);
}

.order-summary__total {
  font-family: var(--tt-type-number-family);
  font-stretch: var(--tt-number-stretch);
  font-size: var(--tt-type-number-size);
  line-height: var(--tt-type-number-line);
  font-weight: var(--tt-type-number-weight);
  font-variant-numeric: tabular-nums;
}

@media (min-width: 768px) {
  .order-summary__thumbs {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}
</style>
