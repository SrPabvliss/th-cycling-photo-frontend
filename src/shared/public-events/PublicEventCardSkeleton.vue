<script setup lang="ts">
import { TtSkeleton } from '@/shared/components/loading'
</script>

<template>
  <div class="event-card" aria-hidden="true">
    <TtSkeleton class="event-card__cover event-card__cover--loading" height="auto" radius="l" />
    <div class="event-card__tag">
      <div class="event-card__info">
        <TtSkeleton class="event-card__date" height="var(--tt-space-7)" />
        <div class="event-card__text">
          <TtSkeleton width="80%" height="var(--tt-space-4)" radius="text" />
          <TtSkeleton width="55%" height="var(--tt-space-3)" radius="text" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./public-event-card.css" />

<style scoped>
.event-card__cover--loading {
  background: var(--tt-primary-soft);
}

.event-card__tag {
  filter: none;
}

.event-card__text {
  gap: var(--tt-space-2);
}
</style>
