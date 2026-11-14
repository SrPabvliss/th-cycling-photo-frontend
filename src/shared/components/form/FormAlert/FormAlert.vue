<script setup lang="ts">
// A message about the whole form, above or next to its button, or about a group whose data did
// not load. 'bad' is announced at once. Listening for `retry` adds the one inline "Reintentar".
defineProps<{
  tone: 'bad' | 'info'
  title: string
  text?: string
  /** A retry is on its way: the button takes no more presses. */
  retrying?: boolean
  onRetry?: () => void
}>()
</script>

<template>
  <div
    class="form-alert"
    :class="`form-alert--${tone}`"
    :role="tone === 'bad' ? 'alert' : undefined"
  >
    <strong>{{ title }}</strong>
    <p v-if="text">{{ text }}</p>
    <slot />
    <button
      v-if="onRetry"
      type="button"
      class="form-alert__retry"
      :disabled="retrying"
      :aria-busy="retrying ? 'true' : undefined"
      @click="onRetry()"
    >
      Reintentar
    </button>
  </div>
</template>

<style scoped>
.form-alert {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-1);
  padding: var(--tt-space-3) var(--tt-space-4);
  border-radius: var(--tt-radius-m);
  font-family: var(--tt-font-sans);
  font-size: var(--tt-type-body-s-size);
  line-height: var(--tt-type-body-s-line);
}

.form-alert--bad {
  background: var(--tt-danger-soft);
  color: var(--tt-danger-ink);
}

.form-alert--info {
  background: var(--tt-primary-soft);
  color: var(--tt-primary-ink);
}

.form-alert p {
  margin: 0;
}

/* Same as the retry of the home's section notice: a link in the alert's own ink. */
.form-alert__retry {
  align-self: flex-start;
  min-block-size: var(--tt-control-m);
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  font-weight: var(--tt-type-title-weight);
  text-decoration: underline;
  cursor: pointer;
}

.form-alert__retry:disabled {
  cursor: progress;
}

.form-alert :deep(a) {
  color: inherit;
  font-weight: var(--tt-type-title-weight);
}
</style>
