<script setup lang="ts">
import { computed } from 'vue'

import { usePricingTiersQuery } from '@/features/pricing/composables/queries/use-pricing-tiers'
import { usePriceSheet } from '@/features/pricing/composables/use-price-sheet'
import { bestOpenTier, buildTierCards, formatMoney } from '@/shared/pricing/tier-cards'

// The band sells the volume price, so it only makes sense with at least two tiers to compare.
// While they load, or if they fail, there is no band: home works the same without it.
const MIN_TIERS = 2

const { data } = usePricingTiersQuery()
const priceSheet = usePriceSheet()

const cards = computed(() =>
  data.value ? buildTierCards(data.value.tiers, data.value.currency) : [],
)

const lead = computed(() => {
  const general = 'El precio baja para todas las fotos de tu pedido.'
  const best = data.value ? bestOpenTier(data.value.tiers) : null
  if (!best || !data.value) return general

  const price = formatMoney(best.pricePerPhoto, data.value.currency)
  return `Desde ${best.minQty} fotos, cada una te sale a ${price}. ${general}`
})
</script>

<template>
  <section v-if="cards.length >= MIN_TIERS" class="price-band">
    <div class="price-band__head">
      <h2 class="price-band__title">Mientras más fotos, menos pagas</h2>
      <p class="price-band__lead">{{ lead }}</p>
    </div>

    <ul class="price-band__cards">
      <li
        v-for="card in cards"
        :key="card.label"
        class="price-band__card"
        :class="{ 'price-band__card--best': card.isBest }"
      >
        <span v-if="card.discountPercent !== null" class="price-band__badge">
          <template v-if="card.isBest">Mejor precio · </template>−{{ card.discountPercent }}%
        </span>
        <span v-else-if="card.isBest" class="price-band__badge">Mejor precio</span>
        <span class="price-band__label">{{ card.label }}</span>
        <strong class="price-band__price">{{ card.price }}</strong>
        <span class="price-band__label">
          cada una<template v-if="card.basePrice">
            · <s>{{ card.basePrice }}</s></template
          >
        </span>
      </li>
    </ul>

    <button type="button" class="price-band__example" @click="priceSheet.open()">
      Ver un ejemplo
    </button>
  </section>
</template>

<style scoped>
/* Mobile first; desktop starts at 768px. */
.price-band {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-3);
  color: var(--tt-ink);
  font-family: var(--tt-font-sans);
}

.price-band__head {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-1);
}

.price-band__title {
  margin: 0;
  font-size: var(--tt-type-heading-m-size);
  line-height: var(--tt-type-heading-m-line);
  font-weight: var(--tt-type-heading-m-weight);
}

.price-band__lead {
  margin: 0;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-s-size);
  line-height: var(--tt-type-body-s-line);
}

.price-band__cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--tt-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.price-band__card {
  display: flex;
  flex-direction: column;
  gap: calc(var(--tt-space-1) / 2);
  padding: var(--tt-space-3);
  border: thin solid var(--tt-line);
  border-radius: var(--tt-radius-m);
  background: var(--tt-surface-raised);
}

.price-band__label {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
}

.price-band__badge {
  align-self: flex-start;
  margin-block-end: var(--tt-space-1);
  padding-inline: var(--tt-space-2);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-primary-soft);
  color: var(--tt-primary-ink);
  font-size: var(--tt-type-count-size);
  line-height: var(--tt-icon-m);
  font-weight: var(--tt-type-count-weight);
}

.price-band__price {
  font-family: var(--tt-type-number-family);
  font-stretch: var(--tt-number-stretch);
  font-size: var(--tt-type-heading-m-size);
  line-height: var(--tt-type-number-line);
  font-weight: var(--tt-type-number-weight);
}

.price-band__card--best {
  border-color: var(--tt-navy);
  background: var(--tt-navy);
  color: var(--tt-on-navy);
  box-shadow: var(--tt-shadow-3);
}

.price-band__card--best .price-band__label {
  color: var(--tt-on-navy-muted);
}

.price-band__card--best .price-band__badge {
  background: var(--tt-primary);
  color: var(--tt-on-primary);
}

.price-band__card--best .price-band__price {
  font-size: var(--tt-type-display-m-size);
}

.price-band__example {
  align-self: flex-start;
  block-size: var(--tt-control-m);
  padding-inline: calc(var(--tt-space-4) + var(--tt-space-1));
  border: 0;
  border-radius: var(--tt-radius-m);
  background: var(--tt-primary-soft);
  color: var(--tt-primary-ink);
  font-family: inherit;
  font-size: var(--tt-type-body-s-medium-size);
  font-weight: var(--tt-type-title-weight);
  cursor: pointer;
}

.price-band__example:hover {
  background: var(--tt-primary-soft-border);
}

@media (min-width: 768px) {
  .price-band__cards {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    max-inline-size: calc(var(--tt-space-8) * 11 + var(--tt-space-4));
  }
}
</style>
