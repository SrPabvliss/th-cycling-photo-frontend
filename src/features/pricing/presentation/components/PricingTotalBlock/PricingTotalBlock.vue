<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { NPopover, NIcon } from 'naive-ui'
import { InformationCircleOutline } from '@vicons/ionicons5'
import PricingTierProgress from '../PricingTierProgress/PricingTierProgress.vue'
import PricingTiersTable from '../PricingTiersTable/PricingTiersTable.vue'
import { usePricingTiersQuery } from '../../../composables/queries/use-pricing-tiers'
import { getBasePricePerPhoto } from '../../../utils/get-base-price-per-photo'
import { formatCurrency } from '../../../utils/format-currency'
import type { IPricingTier } from '../../../types/responses/pricing-preview.response'

const props = withDefaults(
  defineProps<{
    quantity: number
    subtotal: number
    unitPrice: number
    currency: string
    tier: IPricingTier
    nextTier: IPricingTier | null
    photosToNextTier: number | null
    isLoading: boolean
    emphasis?: 'strong' | 'soft'
  }>(),
  { emphasis: 'strong' },
)

const { data: tiersData } = usePricingTiersQuery()

const basePrice = computed(() =>
  tiersData.value ? getBasePricePerPhoto(tiersData.value.tiers) : null,
)
const showBase = computed(() => basePrice.value !== null && props.unitPrice < basePrice.value)

const pulsing = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
watch(
  () => props.unitPrice,
  (next, prev) => {
    if (prev !== undefined && next < prev) {
      clearTimeout(timer)
      pulsing.value = false
      nextTick(() => {
        pulsing.value = true
        timer = setTimeout(() => (pulsing.value = false), 600)
      })
    }
  },
)

onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <div class="pricing-total">
    <PricingTierProgress
      :tier="tier"
      :next-tier="nextTier"
      :photos-to-next-tier="photosToNextTier"
      :quantity="quantity"
      :currency="currency"
      :emphasis="emphasis"
    />
    <div v-if="!nextTier && !isLoading" class="pricing-total__best">
      <span class="pricing-total__best-check">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          aria-hidden="true"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </span>
      <span class="pricing-total__best-text">
        <strong>Mejor precio</strong> · todas a
        <span class="pricing-total__best-price">{{ formatCurrency(unitPrice, currency) }} c/u</span>
      </span>
    </div>

    <!-- Supporting line: per-photo price (secondary to the Total below). -->
    <div class="pricing-total__perphoto" :class="{ 'pricing-total--pulse': pulsing }">
      <span class="pricing-total__perphoto-label">Precio por foto</span>
      <span class="pricing-total__perphoto-value">
        <span v-if="showBase && basePrice !== null" class="pricing-total__base">
          {{ formatCurrency(basePrice, currency) }}
        </span>
        <span class="pricing-total__unit">
          {{ isLoading ? '…' : formatCurrency(unitPrice, currency) }}
        </span>
        <span class="pricing-total__unit-suffix">c/u</span>
      </span>
    </div>

    <!-- Primary: the amount the customer pays. -->
    <div class="pricing-total__row">
      <span class="pricing-total__label">
        Total · {{ quantity }} fotos
        <NPopover v-if="tiersData" trigger="click" placement="top" :show-arrow="true">
          <template #trigger>
            <button
              type="button"
              class="pricing-total__info"
              aria-label="Cómo se calculan los precios"
            >
              <NIcon :component="InformationCircleOutline" :size="16" />
            </button>
          </template>
          <div class="pricing-total__popover">
            <p class="pricing-total__popover-title">Cómo se calculan los precios</p>
            <PricingTiersTable :tiers="tiersData.tiers" :currency="tiersData.currency" />
            <p class="pricing-total__popover-hint">
              Mientras más fotos compres, menos pagas por fotografía.
            </p>
          </div>
        </NPopover>
      </span>
      <span class="pricing-total__amount" :class="{ 'pricing-total--pulse': pulsing }">
        {{ isLoading ? '…' : formatCurrency(subtotal, currency) }}
      </span>
    </div>
  </div>
</template>

<style scoped src="./pricing-total-block.css" />
