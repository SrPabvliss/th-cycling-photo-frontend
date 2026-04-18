<script setup lang="ts">
import { NSkeleton } from 'naive-ui'
</script>

<template>
  <div class="event-card-skeleton">
    <!-- Cover: 155px matches .event-card__cover -->
    <NSkeleton height="155px" :sharp="false" />

    <div class="event-card-skeleton__body">
      <!-- Title: 21px matches font-size 16px * line-height 1.3 -->
      <div class="event-card-skeleton__header">
        <NSkeleton :sharp="false" height="21px" style="width: 75%" />
      </div>

      <!-- Meta row: matches .event-card__meta-row -->
      <div class="event-card-skeleton__meta">
        <NSkeleton :sharp="false" height="18px" style="width: 45%" />
        <NSkeleton :sharp="false" height="14px" style="width: 1px" />
        <NSkeleton :sharp="false" height="18px" style="width: 35%" />
      </div>

      <!-- Footer: matches .event-card__footer -->
      <div class="event-card-skeleton__footer">
        <NSkeleton :sharp="false" height="36px" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-card-skeleton {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--tt-neutral-light);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.event-card-skeleton__body {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.event-card-skeleton__header {
  margin-bottom: 10px;
}

.event-card-skeleton__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.event-card-skeleton__footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}
</style>
