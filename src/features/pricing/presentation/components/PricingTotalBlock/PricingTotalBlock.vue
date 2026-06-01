<script setup lang="ts">
import { NPopover, NIcon } from 'naive-ui'
import { InformationCircleOutline } from '@vicons/ionicons5'
import PricingTiersTable from '../PricingTiersTable/PricingTiersTable.vue'
import PricingTierHint from '../PricingTierHint/PricingTierHint.vue'
import { usePricingTiersQuery } from '../../../composables/queries/use-pricing-tiers'
import { formatCurrency } from '../../../utils/format-currency'
import type { IPricingTier } from '../../../types/responses/pricing-preview.response'

defineProps<{
  quantity: number
  subtotal: number
  unitPrice: number
  currency: string
  nextTier: IPricingTier | null
  photosToNextTier: number | null
  isLoading: boolean
}>()

const { data: tiersData } = usePricingTiersQuery()
</script>

<template>
  <div class="pricing-total">
    <div class="pricing-total__row">
      <span class="pricing-total__label">Total</span>
      <div class="pricing-total__amount-wrap">
        <span class="pricing-total__amount">
          {{ isLoading ? '…' : formatCurrency(subtotal, currency) }}
        </span>
        <NPopover trigger="hover" placement="top" :show-arrow="true">
          <template #trigger>
            <button
              type="button"
              class="pricing-total__info"
              aria-label="Cómo se calculan los precios"
            >
              <NIcon :component="InformationCircleOutline" :size="20" />
            </button>
          </template>
          <div class="pricing-total__popover">
            <p class="pricing-total__popover-title">Cómo se calculan los precios</p>
            <PricingTiersTable
              v-if="tiersData"
              :tiers="tiersData.tiers"
              :currency="tiersData.currency"
            />
            <p class="pricing-total__popover-hint">
              Mientras más fotos compres, menos pagas por foto.
            </p>
          </div>
        </NPopover>
      </div>
    </div>
    <div class="pricing-total__breakdown">
      {{ quantity }} fotos × {{ formatCurrency(unitPrice, currency) }}
    </div>
    <PricingTierHint
      v-if="nextTier"
      :next-tier="nextTier"
      :photos-to-next-tier="photosToNextTier"
      :currency="currency"
    />
  </div>
</template>

<style scoped src="./pricing-total-block.css" />
