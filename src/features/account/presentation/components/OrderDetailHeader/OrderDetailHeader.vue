<script setup lang="ts">
import { computed } from 'vue'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { formatDate } from '@/shared/utils/date.utils'
import type { IMyOrderDetail } from '../../../types/responses/my-order.response'
import { orderCode } from '../../../utils/order-code'
import OrderStatePill from '../OrderStatePill/OrderStatePill.vue'

const props = defineProps<{
  order: IMyOrderDetail
}>()

const meta = computed(
  () => `${orderCode(props.order.id)} · ${formatDate(new Date(props.order.createdAt))}`,
)
</script>

<template>
  <header class="order-head">
    <div class="order-head__title-row">
      <RouterLink
        class="order-head__back"
        :to="`${ROUTE_PATHS.ACCOUNT}/orders`"
        aria-label="Volver a Mis fotos"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </RouterLink>
      <h1 class="order-head__title">{{ order.eventName }}</h1>
    </div>
    <div class="order-head__meta">
      <OrderStatePill :state="order.state" />
      <span class="order-head__code">{{ meta }}</span>
    </div>
  </header>
</template>

<style scoped>
.order-head {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-3);
  font-family: var(--tt-font-sans);
}

.order-head__title-row {
  display: flex;
  align-items: center;
  gap: var(--tt-space-2);
  min-block-size: var(--tt-control-m);
}

.order-head__back {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--tt-control-m);
  block-size: var(--tt-control-m);
  margin-inline-start: calc(var(--tt-space-2) * -1);
  border-radius: var(--tt-radius-pill);
  color: var(--tt-ink);
}

.order-head__back svg {
  inline-size: var(--tt-icon-l);
  block-size: var(--tt-icon-l);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.order-head__title {
  margin: 0;
  min-inline-size: 0;
  font-size: var(--tt-type-heading-l-size);
  line-height: var(--tt-type-heading-l-line);
  font-weight: var(--tt-type-heading-l-weight);
  overflow-wrap: anywhere;
}

.order-head__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--tt-space-2);
}

.order-head__code {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-s-size);
  font-variant-numeric: tabular-nums;
}
</style>
