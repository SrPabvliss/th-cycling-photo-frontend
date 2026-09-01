<script setup lang="ts">
import { computed } from 'vue'

import { formatCurrency } from '@/shared/utils/currency.utils'
import type { IEventDetail } from '../../../../types/responses/event-detail.response'
import { formatNumber } from '@/shared/utils/format.utils'

const props = defineProps<{ event: IEventDetail }>()

const revenueLabel = computed(() => formatCurrency(Number(props.event.revenue), 'USD'))

const soldNote = computed(() => {
  if (props.event.photoCount === 0) return 'todavía sin fotos en línea'
  if (props.event.soldPhotoCount === 0) return 'todavía sin ventas'
  const percent = Math.max(
    1,
    Math.round((props.event.soldPhotoCount / props.event.photoCount) * 100),
  )
  return `${percent}% del catálogo en línea`
})

const ordersLabel = computed(() =>
  props.event.ordersCount === 0 ? '—' : formatNumber(props.event.ordersCount),
)
</script>

<template>
  <div class="money-row">
    <div class="money-tile" data-test="money-revenue">
      <span class="money-tile__label">Ingresos</span>
      <b class="money-tile__value">{{ revenueLabel }}</b>
      <i class="money-tile__note">pagadas y entregadas</i>
    </div>
    <div class="money-tile" data-test="money-sold">
      <span class="money-tile__label">Fotos vendidas</span>
      <b class="money-tile__value">{{ formatNumber(event.soldPhotoCount) }}</b>
      <i class="money-tile__note">{{ soldNote }}</i>
    </div>
    <div class="money-tile" data-test="money-orders">
      <span class="money-tile__label">Órdenes</span>
      <b class="money-tile__value">{{ ordersLabel }}</b>
      <i class="money-tile__note">sin contar carritos sin pagar</i>
    </div>
  </div>
</template>

<style scoped src="./event-money-row.css" />
