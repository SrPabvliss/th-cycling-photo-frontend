<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '@/shared/utils/currency.utils'
import type { IPricingTier } from '../../../types/responses/pricing-preview.response'
import { pluralize } from '@/shared/utils/format.utils'

const props = withDefaults(
  defineProps<{
    tier: IPricingTier
    nextTier: IPricingTier | null
    photosToNextTier: number | null
    quantity: number
    currency: string
    emphasis?: 'strong' | 'soft'
  }>(),
  { emphasis: 'strong' },
)

const active = computed(() => props.nextTier !== null && !!props.photosToNextTier)

/** Progress toward the next tier threshold (quantity / nextTier.minQty). */
const fillPercent = computed(() => {
  if (!props.nextTier || props.nextTier.minQty <= 0) return 100
  return Math.max(0, Math.min(100, Math.round((props.quantity / props.nextTier.minQty) * 100)))
})

const noun = computed(() => pluralize(props.photosToNextTier ?? 0, 'foto', 'fotos'))

const nextPriceLabel = computed(() =>
  props.nextTier ? formatCurrency(props.nextTier.pricePerPhoto, props.currency) : '',
)

const counter = computed(() => {
  if (!active.value || !props.nextTier) return null
  return `${props.quantity} de ${props.nextTier.minQty} fotos`
})
</script>

<template>
  <div v-if="active" class="tier-progress" :class="`tier-progress--${emphasis}`">
    <p class="tier-progress__eyebrow">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        aria-hidden="true"
      >
        <path d="M23 6l-9.5 9.5-5-5L1 18" />
        <path d="M17 6h6v6" />
      </svg>
      Oferta por volumen
    </p>
    <p class="tier-progress__subtitle">
      Agrega {{ photosToNextTier }} {{ noun }} más y <strong>todas</strong> bajan a
      <strong class="tier-progress__price">{{ nextPriceLabel }} c/u</strong>
    </p>
    <div class="tier-progress__bar">
      <div class="tier-progress__fill" :style="{ width: `${fillPercent}%` }" />
    </div>
    <span class="tier-progress__counter">{{ counter }}</span>
  </div>
</template>

<style scoped src="./pricing-tier-progress.css" />
