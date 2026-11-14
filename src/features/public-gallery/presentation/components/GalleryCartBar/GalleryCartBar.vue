<script setup lang="ts">
import { computed } from 'vue'

import { useOnline } from '@/core/network/use-online'
import { checkoutPath } from '@/core/navigation/route-paths'
import { usePriceSheet } from '@/features/pricing/composables/use-price-sheet'
import TierChips from '@/features/pricing/presentation/components/TierChips/TierChips.vue'
import { useCartState } from '@/shared/cart'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import { quotePhotos } from '@/shared/pricing/quote'
import { formatMoney } from '@/shared/pricing/tier-cards'
import { nextTierText } from '@/shared/pricing/tier-text'
import { usePricingTiersQuery } from '@/shared/pricing/use-pricing-tiers'

const props = defineProps<{
  eventId: string
}>()

const cart = useCartState()
const { data: pricing } = usePricingTiersQuery()
const priceSheet = usePriceSheet()

// Only a cart that was read can be counted: zero photos while it loads, or after it failed, is
// not an empty cart.
const isCartKnown = computed(() => cart.status.value === 'success')
const count = computed(() => (isCartKnown.value ? cart.countFor(props.eventId) : 0))
const quote = computed(() => (pricing.value ? quotePhotos(pricing.value.tiers, count.value) : null))

const total = computed(() => {
  const photos = `${count.value} ${count.value === 1 ? 'foto' : 'fotos'}`
  return quote.value && pricing.value
    ? `${photos} · ${formatMoney(quote.value.total, pricing.value.currency)}`
    : photos
})
const nextTier = computed(() =>
  quote.value && pricing.value ? nextTierText(quote.value, pricing.value.currency) : null,
)

// Without tiers and without photos there is nothing to say.
const hasSomething = computed(
  () => !!pricing.value || count.value > 0 || cart.status.value === 'error',
)

// Without network the offline strip says it once: this alert does not repeat it.
const online = useOnline()
</script>

<template>
  <div v-if="hasSomething" class="gallery-cart-bar">
    <TierChips
      v-if="pricing"
      class="gallery-cart-bar__tiers"
      :tiers="pricing.tiers"
      :currency="pricing.currency"
      :quantity="count"
      @open="priceSheet.open(count)"
    />

    <FormAlert
      v-if="cart.status.value === 'error' && online"
      class="gallery-cart-bar__problem"
      data-test="cart-problem"
      tone="warn"
      title="No pudimos cargar tu carrito"
      text="Puede ser tu conexión."
      :retrying="cart.isFetching.value"
      @retry="cart.refetch()"
    />

    <div v-else-if="count > 0" class="gallery-cart-bar__row">
      <div class="gallery-cart-bar__summary">
        <strong class="gallery-cart-bar__total">{{ total }}</strong>
        <span v-if="nextTier" class="gallery-cart-bar__next">{{ nextTier }}</span>
      </div>
      <RouterLink class="gallery-cart-bar__confirm" :to="checkoutPath(eventId)">
        Confirmar pedido
      </RouterLink>
    </div>

    <p v-else-if="isCartKnown && pricing" class="gallery-cart-bar__hint">
      Precio por foto. Cuando llevas más, baja para todas.
    </p>
  </div>
</template>

<style scoped>
/* Sticks to the bottom of the viewport while the gallery scrolls, and takes its own room at the
 * end of it: nothing is hidden behind the bar. */
.gallery-cart-bar {
  position: sticky;
  inset-block-end: 0;
  z-index: var(--tt-layer-cart-bar);
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-2);
  padding: calc(var(--tt-space-2) + var(--tt-space-1) / 2) var(--tt-space-4)
    calc(var(--tt-space-2) + var(--tt-space-1) / 2 + env(safe-area-inset-bottom));
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  box-shadow: var(--tt-shadow-sheet);
  font-family: var(--tt-font-sans);
}

.gallery-cart-bar__row {
  display: flex;
  align-items: center;
  gap: var(--tt-space-3);
}

.gallery-cart-bar__summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-inline-size: 0;
}

.gallery-cart-bar__total {
  font-size: var(--tt-type-body-size);
  line-height: var(--tt-type-body-line);
  font-weight: var(--tt-type-heading-m-weight);
}

.gallery-cart-bar__next,
.gallery-cart-bar__hint {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
}

.gallery-cart-bar__hint {
  margin: 0;
  text-align: center;
}

.gallery-cart-bar__problem {
  flex: 1;
}

.gallery-cart-bar__confirm {
  flex: none;
  display: flex;
  align-items: center;
  block-size: var(--tt-control-m);
  padding-inline: calc(var(--tt-space-4) + var(--tt-space-1));
  border-radius: var(--tt-radius-m);
  background: var(--tt-primary);
  color: var(--tt-on-primary);
  text-decoration: none;
  font-size: var(--tt-type-body-s-medium-size);
  font-weight: var(--tt-type-title-weight);
}

.gallery-cart-bar__confirm:hover {
  background: var(--tt-primary-hover);
}

@media (min-width: 768px) {
  .gallery-cart-bar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: var(--tt-space-5);
    padding-inline: var(--tt-space-6);
  }

  .gallery-cart-bar__tiers {
    flex: none;
    inline-size: calc(var(--tt-ilu-page) * 2 + var(--tt-space-5) - var(--tt-space-1));
  }

  .gallery-cart-bar__summary {
    flex: none;
  }

  .gallery-cart-bar__hint {
    text-align: start;
  }
}
</style>
