<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { BulbOutline } from '@vicons/ionicons5'
import { formatCurrency } from '../../../utils/format-currency'
import type { IPricingTier } from '../../../types/responses/pricing-preview.response'

const props = defineProps<{
  nextTier: IPricingTier | null
  photosToNextTier: number | null
  currency: string
}>()

const message = computed(() => {
  if (!props.nextTier || !props.photosToNextTier) return null
  const n = props.photosToNextTier
  const price = formatCurrency(props.nextTier.pricePerPhoto, props.currency)
  return `Lleva ${n} más y paga solo ${price} por foto`
})
</script>

<template>
  <div v-if="message" class="pt-hint">
    <NIcon :component="BulbOutline" :size="16" class="pt-hint__icon" />
    <span class="pt-hint__text">{{ message }}</span>
  </div>
</template>

<style scoped src="./pricing-tier-hint.css" />
