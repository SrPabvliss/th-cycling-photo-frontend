<script setup lang="ts">
import { TtSkeleton } from '@/shared/components/loading'
</script>

<template>
  <div class="order-row-skeleton" aria-hidden="true">
    <span class="order-row-skeleton__previews">
      <TtSkeleton class="order-row-skeleton__preview" height="auto" radius="s" />
      <TtSkeleton class="order-row-skeleton__preview" height="auto" radius="s" />
    </span>
    <span class="order-row-skeleton__body">
      <TtSkeleton width="70%" height="var(--tt-space-4)" radius="text" />
      <TtSkeleton width="50%" height="var(--tt-space-3)" radius="text" />
      <TtSkeleton width="40%" height="var(--tt-space-5)" radius="pill" />
    </span>
  </div>
</template>

<style scoped>
.order-row-skeleton {
  display: flex;
  align-items: center;
  gap: var(--tt-space-3);
  padding: var(--tt-space-3);
  border-radius: var(--tt-radius-l);
  background: var(--tt-surface-raised);
  box-shadow: var(--tt-card-edge), var(--tt-shadow-2);
}

.order-row-skeleton__previews {
  flex: none;
  display: grid;
  grid-template-columns: repeat(2, calc(var(--tt-control-m) - var(--tt-space-1) / 2));
  gap: var(--tt-space-1);
}

.order-row-skeleton__preview {
  aspect-ratio: 3 / 4;
}

.order-row-skeleton__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--tt-space-2);
}
</style>
