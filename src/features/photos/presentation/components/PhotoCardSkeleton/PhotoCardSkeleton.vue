<script setup lang="ts">
import { NSkeleton } from 'naive-ui'
</script>

<template>
  <div class="photo-card-skeleton">
    <!-- Cover: matches .photo-card__cover aspect-ratio 4/3 -->
    <NSkeleton height="0" style="padding-bottom: 75%" :sharp="false" />

    <div class="photo-card-skeleton__body">
      <!-- Filename -->
      <NSkeleton :sharp="false" height="17px" style="width: 70%; margin-bottom: 6px" />
      <!-- Meta -->
      <NSkeleton :sharp="false" height="16px" style="width: 50%" />
    </div>
  </div>
</template>

<style scoped>
.photo-card-skeleton {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--tt-neutral-light);
}

.photo-card-skeleton__body {
  padding: 12px;
}
</style>
