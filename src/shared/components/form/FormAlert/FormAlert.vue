<script setup lang="ts">
import { computed, useSlots } from 'vue'

// A message about the whole form, above or next to its button, or about a group whose data did
// not load. 'bad' is announced at once. Listening for `retry` adds the one inline "Reintentar";
// the `actions` slot holds any other way out, beside it. The default slot adds to the text.
const props = defineProps<{
  tone: 'bad' | 'info'
  title: string
  text?: string
  /** A retry is on its way: the button takes no more presses. */
  retrying?: boolean
  onRetry?: () => void
}>()

const slots = useSlots()

// Title and detail read as one sentence block, so the title ends as a sentence does.
const heading = computed(() =>
  props.text && !/[.!?…:]$/.test(props.title) ? `${props.title}.` : props.title,
)
const hasActions = computed(() => !!props.onRetry || !!slots.actions)
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
    <div class="form-alert__main">
      <div class="form-alert__body">
        <p class="form-alert__message">
          <strong class="form-alert__title">{{ heading }}</strong>
          <template v-if="text">{{ ' ' }}{{ text }}</template>
        </p>
        <slot />
      </div>
      <div v-if="hasActions" class="form-alert__actions">
        <slot name="actions" />
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
  </div>
</template>

<style scoped>
/* One row: sign, text, way out. The way out drops under the text only when it does not fit. */
.form-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--tt-space-2);
  padding: var(--tt-space-3) var(--tt-space-4);
  border-radius: var(--tt-radius-m);
  font-family: var(--tt-font-sans);
  font-size: var(--tt-type-body-s-size);
  font-weight: var(--tt-type-body-s-weight);
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

/* Centred on the first line of text. */
.form-alert__icon {
  flex: none;
  inline-size: var(--tt-icon-m);
  block-size: var(--tt-icon-m);
  margin-block-start: calc((var(--tt-type-body-s-line) - var(--tt-icon-m)) / 2);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.form-alert__main {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--tt-space-1) var(--tt-space-3);
  min-inline-size: 0;
}

/* Below this width the text would read badly beside the way out: then the way out wraps. */
.form-alert__body {
  display: flex;
  flex: 1 1 calc(var(--tt-space-8) * 2);
  flex-direction: column;
  gap: var(--tt-space-1);
  min-inline-size: 0;
}

.form-alert__title {
  font-weight: var(--tt-type-heading-m-weight);
}

.form-alert p {
  margin: 0;
}

.form-alert__actions {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--tt-space-1) var(--tt-space-3);
}

/* A finger's room for each way out, reaching into the padding instead of growing the box. */
.form-alert__retry,
.form-alert__actions :slotted(a),
.form-alert__actions :slotted(button) {
  display: inline-flex;
  align-items: center;
  min-block-size: var(--tt-control-m);
  margin-block: calc((var(--tt-type-body-s-line) - var(--tt-control-m)) / 2);
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
