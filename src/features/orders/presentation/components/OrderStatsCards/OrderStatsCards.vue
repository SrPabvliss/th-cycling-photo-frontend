<script setup lang="ts">
import { computed } from 'vue'
import { NIcon, NPopover } from 'naive-ui'
import { InformationCircleOutline } from '@vicons/ionicons5'
import type { IOrderStats } from '../../../types/responses/order-stats.response'
import { formatCurrency } from '@/shared/utils/currency.utils'

const props = defineProps<{
  stats: IOrderStats | undefined
}>()

interface IStatCard {
  key: string
  value: number
  label: string
  variant: 'error' | 'warning' | 'info' | 'success' | 'gift'
}

const totalOrders = computed(() => props.stats?.totalOrders ?? 0)
const totalRevenue = computed(() => formatCurrency(props.stats?.totalRevenue ?? 0, 'USD'))

const breakdown = computed<IStatCard[]>(() => [
  {
    key: 'pending',
    value: props.stats?.pendingCount ?? 0,
    label: 'Pendientes',
    variant: 'error',
  },
  {
    key: 'info',
    value: props.stats?.paymentInfoSentCount ?? 0,
    label: 'Info enviada',
    variant: 'warning',
  },
  {
    key: 'paid',
    value: props.stats?.paidCount ?? 0,
    label: 'Pagados',
    variant: 'info',
  },
  {
    key: 'delivered',
    value: props.stats?.deliveredCount ?? 0,
    label: 'Entregados',
    variant: 'success',
  },
  {
    key: 'gifted',
    value: props.stats?.giftedCount ?? 0,
    label: 'Regaladas',
    variant: 'gift',
  },
])

const breakdownSum = computed(() => breakdown.value.reduce((acc, item) => acc + item.value, 0))

const segments = computed(() =>
  breakdown.value
    .filter((item) => item.value > 0)
    .map((item) => ({
      ...item,
      percent: breakdownSum.value > 0 ? (item.value / breakdownSum.value) * 100 : 0,
    })),
)
</script>

<template>
  <!-- Desktop / tablet: cards individuales -->
  <div class="stats-row stats-row--cards">
    <div class="stat-card stat-card--revenue">
      <span class="stat-card__num">{{ totalRevenue }}</span>
      <span class="stat-card__label">
        Ingresos
        <NPopover trigger="click" placement="top" :show-arrow="true">
          <template #trigger>
            <button
              type="button"
              class="stat-card__info"
              aria-label="Cómo se calculan los ingresos"
            >
              <NIcon :component="InformationCircleOutline" :size="14" />
            </button>
          </template>
          <div class="stat-card__popover">
            <p class="stat-card__popover-title">Cómo se calculan los ingresos</p>
            <p class="stat-card__popover-text">
              Suma del subtotal de los pedidos pagados y entregados. No incluye pedidos pendientes,
              con info enviada, regalados ni cancelados.
            </p>
            <p class="stat-card__popover-hint">
              Al filtrar por un evento se muestran solo sus ingresos.
            </p>
          </div>
        </NPopover>
      </span>
    </div>
    <div class="stat-card stat-card--total">
      <span class="stat-card__num">{{ totalOrders }}</span>
      <span class="stat-card__label">Total pedidos</span>
    </div>
    <div
      v-for="item in breakdown"
      :key="item.key"
      class="stat-card"
      :class="`stat-card--${item.variant}`"
    >
      <span class="stat-card__num">{{ item.value }}</span>
      <span class="stat-card__label">{{ item.label }}</span>
    </div>
  </div>

  <!-- Mobile: barra de distribución -->
  <div class="stats-bar">
    <div class="stats-bar__header">
      <span class="stats-bar__title">Total pedidos</span>
      <span class="stats-bar__total">{{ totalOrders }}</span>
    </div>
    <div class="stats-bar__header stats-bar__header--revenue">
      <span class="stats-bar__title">
        Ingresos
        <NPopover trigger="click" placement="top" :show-arrow="true">
          <template #trigger>
            <button
              type="button"
              class="stat-card__info"
              aria-label="Cómo se calculan los ingresos"
            >
              <NIcon :component="InformationCircleOutline" :size="14" />
            </button>
          </template>
          <div class="stat-card__popover">
            <p class="stat-card__popover-title">Cómo se calculan los ingresos</p>
            <p class="stat-card__popover-text">
              Suma del subtotal de los pedidos pagados y entregados. No incluye pedidos pendientes,
              con info enviada, regalados ni cancelados.
            </p>
            <p class="stat-card__popover-hint">
              Al filtrar por un evento se muestran solo sus ingresos.
            </p>
          </div>
        </NPopover>
      </span>
      <span class="stats-bar__total">{{ totalRevenue }}</span>
    </div>
    <div class="stats-bar__track" :aria-label="`Distribución de ${totalOrders} pedidos`">
      <div
        v-for="seg in segments"
        :key="seg.key"
        class="stats-bar__segment"
        :class="`stats-bar__segment--${seg.variant}`"
        :style="{ width: `${seg.percent}%` }"
        :title="`${seg.label}: ${seg.value}`"
      />
    </div>
    <ul class="stats-bar__legend">
      <li v-for="item in breakdown" :key="item.key" class="stats-bar__legend-item">
        <span
          class="stats-bar__chip"
          :class="`stats-bar__chip--${item.variant}`"
          aria-hidden="true"
        />
        <span class="stats-bar__count">{{ item.value }}</span>
        <span class="stats-bar__label">{{ item.label }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped src="./order-stats-cards.css" />
