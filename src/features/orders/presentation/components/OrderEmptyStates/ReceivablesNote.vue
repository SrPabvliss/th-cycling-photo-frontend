<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { HourglassOutline } from '@vicons/ionicons5'

import { formatCurrency } from '@/shared/utils/currency.utils'

const props = defineProps<{
  openCount: number
  openAmount: string
  pendingCount: number
  infoSentCount: number
}>()

const amountDisplay = computed(() => formatCurrency(Number(props.openAmount), 'USD'))

const countLabel = computed(() =>
  props.openCount === 1 ? '1 pedido espera dinero' : `${props.openCount} pedidos esperan dinero`,
)
</script>

<template>
  <div class="oes-headsup" data-test="receivables-note">
    <NIcon :component="HourglassOutline" :size="15" />
    <div>
      <b>{{ countLabel }}: {{ amountDisplay }}.</b>
      {{ pendingCount }} todavía no saben cómo pagar y {{ infoSentCount }} ya recibieron la info.
    </div>
  </div>
</template>

<style scoped src="./order-empty-states.css" />
