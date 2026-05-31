<script setup lang="ts">
import type { IOrderStats } from '../../../types/responses/order-stats.response'

defineProps<{
  stats: IOrderStats | undefined
}>()
</script>

<template>
  <div class="stats-row">
    <div class="stat-card">
      <span class="stat-card__num">{{ stats?.totalOrders ?? '-' }}</span>
      <span class="stat-card__label">Total pedidos</span>
    </div>
    <div class="stat-card stat-card--error">
      <span class="stat-card__num">{{ stats?.pendingCount ?? '-' }}</span>
      <span class="stat-card__label">Pendientes</span>
    </div>
    <div class="stat-card stat-card--warning">
      <span class="stat-card__num">{{ stats?.paymentInfoSentCount ?? '-' }}</span>
      <span class="stat-card__label">Info enviada</span>
    </div>
    <div class="stat-card stat-card--info">
      <span class="stat-card__num">{{ stats?.paidCount ?? '-' }}</span>
      <span class="stat-card__label">Pagados</span>
    </div>
    <div class="stat-card stat-card--success">
      <span class="stat-card__num">{{ stats?.deliveredCount ?? '-' }}</span>
      <span class="stat-card__label">Entregados</span>
    </div>
  </div>
</template>

<style scoped src="./order-stats-cards.css" />
