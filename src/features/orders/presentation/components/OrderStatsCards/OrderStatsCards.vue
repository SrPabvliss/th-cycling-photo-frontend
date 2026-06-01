<script setup lang="ts">
import { computed } from 'vue'
import type { IOrderStats } from '../../../types/responses/order-stats.response'

const props = defineProps<{
  stats: IOrderStats | undefined
}>()

interface IStatCard {
  key: string
  value: number
  label: string
  variant: 'error' | 'warning' | 'info' | 'success'
}

const totalOrders = computed(() => props.stats?.totalOrders ?? 0)

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
