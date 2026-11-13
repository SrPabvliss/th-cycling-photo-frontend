<script setup lang="ts">
import { computed } from 'vue'

import { quotePhotos, sortTiers } from '@/shared/pricing/quote'
import { buildTierCards, tierShortLabel, type IPriceTier } from '@/shared/pricing/tier-cards'

const props = defineProps<{
  tiers: IPriceTier[]
  currency: string
  /** Photos of the event in the cart: the tier they fall in is marked. */
  quantity: number
}>()

const emit = defineEmits<{
  open: []
}>()

const segments = computed(() => {
  const sorted = sortTiers(props.tiers)
  const cards = buildTierCards(sorted, props.currency)
  const current = quotePhotos(sorted, props.quantity)?.tierIndex ?? -1

  return sorted.map((tier, index) => ({
    key: tier.minQty,
    label: `${tierShortLabel(tier)} fotos`,
    price: cards[index]!.price,
    isCurrent: index === current,
    isBest: cards[index]!.isBest,
  }))
})
</script>

<template>
  <button
    type="button"
    class="tier-chips tt-hit-area"
    aria-label="Precio por foto según cuántas lleves. Ver cómo funciona"
    @click="emit('open')"
  >
    <span
      v-for="segment in segments"
      :key="segment.key"
      class="tier-chips__tier"
      :class="{
        'tier-chips__tier--current': segment.isCurrent,
        'tier-chips__tier--best': segment.isBest,
      }"
    >
      <span class="tier-chips__label">{{ segment.label }}</span>
      <span class="tier-chips__price">{{ segment.price }}</span>
    </span>
  </button>
</template>

<style scoped>
.tier-chips {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: calc(var(--tt-space-1) * 3 / 2);
  padding: 0;
  border: 0;
  background: none;
  color: var(--tt-ink);
  font-family: var(--tt-font-sans);
  text-align: center;
  cursor: pointer;
}

.tier-chips__tier {
  display: flex;
  flex-direction: column;
  padding: var(--tt-space-1) calc(var(--tt-space-1) * 3 / 2);
  border: thin solid var(--tt-line);
  border-radius: var(--tt-radius-s);
  background: var(--tt-surface-raised);
}

.tier-chips__label {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-count-size);
  line-height: var(--tt-type-count-line);
}

.tier-chips__price {
  font-size: var(--tt-type-body-s-medium-size);
  line-height: var(--tt-type-caption-line);
  font-weight: var(--tt-type-heading-m-weight);
}

.tier-chips__tier--best {
  border-style: dashed;
  border-color: var(--tt-primary);
}

.tier-chips__tier--best .tier-chips__price {
  color: var(--tt-primary-ink);
}

.tier-chips__tier--current {
  border-style: solid;
  border-color: var(--tt-primary);
  background: var(--tt-primary-soft);
}

.tier-chips__tier--current .tier-chips__label,
.tier-chips__tier--current .tier-chips__price {
  color: var(--tt-primary-ink);
}
</style>
