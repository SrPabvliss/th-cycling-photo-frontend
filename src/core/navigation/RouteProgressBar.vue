<script setup lang="ts">
import { currentArea } from '@/core/theme/area'
import { routeProgressActive } from './route-progress'
</script>

<template>
  <div
    v-if="routeProgressActive && currentArea === 'client'"
    class="route-progress"
    aria-hidden="true"
  >
    <div class="route-progress__bar" />
  </div>
</template>

<style scoped>
.route-progress {
  position: fixed;
  inset-block-start: 0;
  inset-inline: 0;
  z-index: 6000;
  block-size: var(--tt-top-progress-height);
  overflow: hidden;
  pointer-events: none;
}

.route-progress__bar {
  inline-size: 40%;
  block-size: 100%;
  background: var(--tt-primary);
  animation: route-progress-slide var(--tt-loader-cycle) var(--tt-easing-loader-bar) infinite;
}

@keyframes route-progress-slide {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(250%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .route-progress__bar {
    inline-size: 100%;
    animation: none;
  }
}
</style>
