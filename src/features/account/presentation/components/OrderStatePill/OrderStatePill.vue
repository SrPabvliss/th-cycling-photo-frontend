<script setup lang="ts">
import { computed } from 'vue'

import { ORDER_STATE_PILL } from '../../../constants/order-state-pill'
import type { MyOrderState } from '../../../types/responses/my-order.response'

const props = defineProps<{
  state: MyOrderState
}>()

const pill = computed(() => ORDER_STATE_PILL[props.state])
</script>

<template>
  <span class="order-state-pill" :data-state="state" :data-tone="pill.tone">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="pill.icon" /></svg>
    {{ pill.text }}
  </span>
</template>

<style scoped>
.order-state-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--tt-space-1);
  min-block-size: var(--tt-space-5);
  padding: 0 var(--tt-space-2);
  border-radius: var(--tt-radius-pill);
  font-family: var(--tt-font-sans);
  font-size: var(--tt-type-label-size);
  font-weight: var(--tt-type-title-weight);
  white-space: nowrap;
}

.order-state-pill svg {
  inline-size: var(--tt-icon-s);
  block-size: var(--tt-icon-s);
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.order-state-pill[data-tone='ok'] {
  background: var(--tt-success-soft);
  color: var(--tt-success-ink);
}

.order-state-pill[data-tone='warn'] {
  background: var(--tt-warning-soft);
  color: var(--tt-warning-ink);
}

.order-state-pill[data-tone='off'] {
  background: var(--tt-line-subtle);
  color: var(--tt-ink-muted);
}

.order-state-pill[data-tone='info'] {
  background: var(--tt-primary-soft);
  color: var(--tt-primary-ink);
}
</style>
