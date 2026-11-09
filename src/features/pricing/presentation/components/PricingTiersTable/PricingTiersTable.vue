<script setup lang="ts">
import type { IPricingTier } from '../../../types/responses/pricing-preview.response'
import { formatCurrency } from '@/shared/utils/currency.utils'

defineProps<{ tiers: IPricingTier[]; currency: string }>()

function rangeLabel(t: IPricingTier): string {
  if (t.maxQty === null) return `${t.minQty}+`
  if (t.minQty === t.maxQty) return `${t.minQty}`
  return `${t.minQty} - ${t.maxQty}`
}
</script>

<template>
  <table class="pt-table">
    <thead>
      <tr>
        <th>Fotos</th>
        <th>Precio por fotografía</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="t in tiers" :key="t.minQty">
        <td>{{ rangeLabel(t) }}</td>
        <td>{{ formatCurrency(t.pricePerPhoto, currency) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped src="./pricing-tiers-table.css" />
