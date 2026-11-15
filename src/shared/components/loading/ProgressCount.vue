<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  done: number
  total: number
  /** The verb of the work: "Descargando", "Subiendo". */
  label: string
}>()

const total = computed(() => Math.max(0, props.total))
const done = computed(() => Math.min(Math.max(0, props.done), total.value))
const percent = computed(() => (total.value > 0 ? (done.value / total.value) * 100 : 0))
</script>

<template>
  <div class="progress-count">
    <div class="progress-count__head">
      <p class="progress-count__text">{{ label }} {{ done }} de {{ total }}</p>
      <slot name="action" />
    </div>
    <div
      class="progress-count__bar"
      role="progressbar"
      :aria-label="label"
      :aria-valuenow="done"
      aria-valuemin="0"
      :aria-valuemax="total"
    >
      <div class="progress-count__fill" :style="{ width: `${percent}%` }" />
    </div>
  </div>
</template>

<style scoped>
.progress-count {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-2);
}

.progress-count__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--tt-space-3);
}

.progress-count__text {
  margin: 0;
  color: var(--tt-ink);
  font-family: var(--tt-type-body-medium-family);
  font-size: var(--tt-type-body-medium-size);
  line-height: var(--tt-type-body-medium-line);
  font-weight: var(--tt-type-body-medium-weight);
  font-variant-numeric: tabular-nums;
}

.progress-count__bar {
  block-size: var(--tt-upload-bar-height);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-primary-soft);
  overflow: hidden;
}

.progress-count__fill {
  block-size: 100%;
  border-radius: var(--tt-radius-pill);
  background: var(--tt-primary);
  transition: width var(--tt-motion-base) var(--tt-easing-loader-fill);
}

@media (prefers-reduced-motion: reduce) {
  .progress-count__fill {
    transition: none;
  }
}
</style>
