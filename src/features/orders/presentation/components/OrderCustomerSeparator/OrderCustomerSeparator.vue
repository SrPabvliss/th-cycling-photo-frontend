<script setup lang="ts">
import { computed } from 'vue'

import { formatWhatsAppNumber } from '@/shared/utils/phone.utils'

const props = defineProps<{
  label: string
  phone: string | null
  orderCount: number
}>()

const formattedPhone = computed(() => (props.phone ? formatWhatsAppNumber(props.phone) : null))

const orderCountLabel = computed(
  () => `${props.orderCount} ${props.orderCount === 1 ? 'orden' : 'órdenes'}`,
)

const initials = computed(() => {
  const parts = props.label.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const second = parts[1]?.[0] ?? ''
  return (first + second).toUpperCase() || '?'
})
</script>

<template>
  <div class="order-customer-separator">
    <div class="order-customer-separator__avatar" aria-hidden="true">
      {{ initials }}
    </div>
    <div class="order-customer-separator__identity">
      <div class="order-customer-separator__name">{{ label }}</div>
      <div v-if="formattedPhone" class="order-customer-separator__phone">
        {{ formattedPhone }}
      </div>
    </div>
    <div class="order-customer-separator__count">{{ orderCountLabel }}</div>
  </div>
</template>

<style scoped src="./order-customer-separator.css" />
