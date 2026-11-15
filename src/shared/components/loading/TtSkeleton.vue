<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string
    height?: string
    radius?: 'text' | 's' | 'm' | 'l' | 'pill'
  }>(),
  { radius: 's' },
)
</script>

<template>
  <span
    class="tt-skeleton"
    :class="`tt-skeleton--${radius}`"
    :style="{ width, height }"
    aria-hidden="true"
  />
</template>

<style scoped>
.tt-skeleton {
  display: block;
  inline-size: 100%;
  block-size: 1em;
  background: var(--tt-primary-soft);
  animation: tt-skeleton-pulse var(--tt-loader-pulse) var(--tt-easing-standard) infinite;
}

.tt-skeleton--text {
  border-radius: var(--tt-skeleton-radius-text);
}

.tt-skeleton--s {
  border-radius: var(--tt-radius-s);
}

.tt-skeleton--m {
  border-radius: var(--tt-radius-m);
}

.tt-skeleton--l {
  border-radius: var(--tt-radius-l);
}

.tt-skeleton--pill {
  border-radius: var(--tt-radius-pill);
}

@keyframes tt-skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tt-skeleton {
    animation: none;
  }
}
</style>
