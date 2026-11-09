<script setup lang="ts">
import { computed } from 'vue'
import { NIcon, NPopover } from 'naive-ui'
import {
  CashOutline,
  CubeOutline,
  GiftOutline,
  HourglassOutline,
  InformationCircleOutline,
  ReceiptOutline,
} from '@vicons/ionicons5'
import type { IOrderStats } from '../../../types/responses/order-stats.response'
import { formatCurrency } from '@/shared/utils/currency.utils'
import StatTile from '@/shared/components/StatTile/StatTile.vue'

const props = defineProps<{
  stats: IOrderStats | undefined
}>()

interface IStatCard {
  key: string
  value: number
  label: string
  variant: 'error' | 'warning' | 'info' | 'success' | 'gift'
}

function formatCount(value: number | undefined): string {
  return value != null ? value.toLocaleString('de-DE') : '—'
}

const totalOrders = computed(() => props.stats?.totalOrders ?? 0)
const totalRevenue = computed(() => formatCurrency(props.stats?.totalRevenue ?? 0, 'USD'))

const ordersNote = computed(() =>
  props.stats
    ? `${formatCount(props.stats.activeOrders)} activos · ${formatCount(props.stats.cancelledCount)} cancelados`
    : undefined,
)
const openAmount = computed(() =>
  props.stats ? formatCurrency(Number(props.stats.openAmount), 'USD') : undefined,
)
const openNote = computed(() =>
  props.stats
    ? `${formatCount(props.stats.pendingCount)} pendientes · ${formatCount(props.stats.paymentInfoSentCount)} con info enviada`
    : undefined,
)

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
  <div class="order-stat-tiles">
    <StatTile
      label="Ingresos"
      :value="totalRevenue"
      :icon="CashOutline"
      tone="green"
      note="Pedidos pagados y entregados"
    >
      <template #label-extra>
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
      </template>
    </StatTile>
    <StatTile
      label="Pedidos"
      :value="formatCount(stats?.totalOrders)"
      :icon="ReceiptOutline"
      tone="navy"
      :note="ordersNote"
    />
    <StatTile
      label="Por cobrar"
      :value="formatCount(stats?.openCount)"
      :detail="openAmount"
      :icon="HourglassOutline"
      tone="amber"
      :note="openNote"
    />
    <StatTile
      label="Por entregar"
      :value="formatCount(stats?.awaitingDeliveryCount)"
      :icon="CubeOutline"
      tone="blue"
      note="Pagados o regalados sin entregar"
    />
    <StatTile
      label="Regaladas"
      :value="formatCount(stats?.giftedCount)"
      :icon="GiftOutline"
      tone="violet"
      note="Sin cobro"
    />
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
