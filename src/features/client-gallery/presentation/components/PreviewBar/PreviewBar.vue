<script setup lang="ts">
import { computed } from 'vue'
import { NButton } from 'naive-ui'

import TierChips from '@/features/pricing/presentation/components/TierChips/TierChips.vue'
import { usePriceSheet } from '@/features/pricing/composables/use-price-sheet'
import { quotePhotos } from '@/shared/pricing/quote'
import { formatMoney } from '@/shared/pricing/tier-cards'
import { nextTierText } from '@/shared/pricing/tier-text'
import { usePricingTiersQuery } from '@/shared/pricing/use-pricing-tiers'

// Fixed at the bottom while the buyer picks: how many, what they cost, and the way on.
const props = defineProps<{
  count: number
}>()

const emit = defineEmits<{
  continue: []
}>()

const { data: pricing } = usePricingTiersQuery()
const priceSheet = usePriceSheet()

const quote = computed(() => (pricing.value ? quotePhotos(pricing.value.tiers, props.count) : null))
const summary = computed(() => {
  const photos = props.count === 1 ? '1 foto elegida' : `${props.count} fotos elegidas`
  return quote.value && pricing.value
    ? `${photos} · ${formatMoney(quote.value.total, pricing.value.currency)}`
    : photos
})
const nextTier = computed(() =>
  quote.value && pricing.value ? nextTierText(quote.value, pricing.value.currency) : null,
)
</script>

<template>
  <div class="preview-bar">
    <TierChips
      v-if="pricing"
      :tiers="pricing.tiers"
      :currency="pricing.currency"
      :quantity="count"
      @open="priceSheet.open(count)"
    />

    <div v-if="count > 0" class="preview-bar__row">
      <div class="preview-bar__summary">
        <strong>{{ summary }}</strong>
        <span v-if="nextTier" class="preview-bar__muted">{{ nextTier }}</span>
      </div>
      <NButton type="primary" size="large" @click="emit('continue')">Continuar</NButton>
    </div>

    <p v-else-if="pricing" class="preview-bar__muted preview-bar__hint">
      Precio por foto. Cuando llevas más, baja para todas.
    </p>
  </div>
</template>

<style scoped>
.preview-bar {
  position: sticky;
  inset-block-end: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-2);
  padding: var(--tt-space-3) var(--tt-space-4) calc(var(--tt-space-3) + env(safe-area-inset-bottom));
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  box-shadow: var(--tt-shadow-sheet);
  font-family: var(--tt-font-sans);
}

.preview-bar__row {
  display: flex;
  align-items: center;
  gap: var(--tt-space-3);
}

.preview-bar__summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-inline-size: 0;
}

.preview-bar__muted {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
}

.preview-bar__hint {
  margin: 0;
  text-align: center;
}
</style>
