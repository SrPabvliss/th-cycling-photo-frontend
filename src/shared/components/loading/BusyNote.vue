<script setup lang="ts">
withDefaults(
  defineProps<{
    /** What is happening, in words. A spinner alone does not say it. */
    text: string
    size?: 's' | 'm'
  }>(),
  { size: 'm' },
)
</script>

<template>
  <p class="busy-note" :class="`busy-note--${size}`" role="status">
    <svg class="busy-note__spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle class="busy-note__track" cx="12" cy="12" r="9" stroke-width="3" />
      <path
        class="busy-note__arc"
        d="M12 3a9 9 0 0 1 9 9"
        stroke-width="3"
        stroke-linecap="round"
      />
    </svg>
    <span class="busy-note__text">{{ text }}</span>
  </p>
</template>

<style scoped>
.busy-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--tt-space-3);
  margin: 0;
  color: var(--tt-ink-muted);
  font-family: var(--tt-type-body-family);
  font-size: var(--tt-type-body-size);
  line-height: var(--tt-type-body-line);
  font-weight: var(--tt-type-body-weight);
}

.busy-note--s {
  gap: var(--tt-space-2);
  font-family: var(--tt-type-body-s-family);
  font-size: var(--tt-type-body-s-size);
  line-height: var(--tt-type-body-s-line);
  font-weight: var(--tt-type-body-s-weight);
}

.busy-note__spinner {
  flex: none;
  inline-size: var(--tt-loader-md);
  block-size: var(--tt-loader-md);
  animation: busy-note-spin var(--tt-loader-spin) var(--tt-easing-loader-spin) infinite;
}

.busy-note--s .busy-note__spinner {
  inline-size: var(--tt-loader-xs);
  block-size: var(--tt-loader-xs);
}

.busy-note__track {
  stroke: var(--tt-primary-soft);
}

.busy-note__arc {
  stroke: var(--tt-primary);
}

@keyframes busy-note-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .busy-note__spinner {
    animation: none;
  }
}
</style>
