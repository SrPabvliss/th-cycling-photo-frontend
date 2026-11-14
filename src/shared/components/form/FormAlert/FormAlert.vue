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
    <svg
      class="form-alert__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      :data-icon="tone === 'bad' ? 'warn' : 'info'"
    >
      <template v-if="tone === 'bad'">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
        <path d="M12 9v4M12 17h.01" />
      </template>
      <template v-else>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 16v-4M12 8h.01" />
      </template>
    </svg>
    <div class="form-alert__body">
      <strong class="form-alert__title">{{ title }}</strong>
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
  </div>
</template>

<style scoped>
/* The demo's alert: sign, then title, text and the way out. */
.form-alert {
  display: flex;
  gap: var(--tt-space-2);
  padding: var(--tt-space-4);
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

.form-alert__icon {
  flex: none;
  inline-size: var(--tt-icon-m);
  block-size: var(--tt-icon-m);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.form-alert__body {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-1);
  min-inline-size: 0;
}

.form-alert__title {
  font-size: var(--tt-type-body-size);
  font-weight: var(--tt-type-heading-m-weight);
}

.form-alert p {
  margin: 0;
}

/* The one inline retry of the client: a link in the alert's own ink, with a finger's room. */
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
