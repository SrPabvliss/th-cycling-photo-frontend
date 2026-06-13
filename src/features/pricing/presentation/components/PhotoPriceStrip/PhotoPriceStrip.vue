<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { formatCurrency } from '../../../utils/format-currency'

const props = withDefaults(
  defineProps<{
    unitPrice: number
    currency: string
    basePrice?: number | null
    isLoading?: boolean
  }>(),
  { basePrice: null, isLoading: false },
)

const showBase = computed(() => props.basePrice !== null && props.unitPrice < props.basePrice)

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
  <div class="price-strip" :class="{ 'price-strip--pulse': pulsing }">
    <span v-if="showBase && basePrice !== null" class="price-strip__was">
      {{ formatCurrency(basePrice, currency) }}
    </span>
    <span class="price-strip__now">
      {{ isLoading ? '…' : formatCurrency(unitPrice, currency) }}
    </span>
  </div>
</template>

<style scoped src="./photo-price-strip.css" />
