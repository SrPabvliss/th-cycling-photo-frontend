<script setup lang="ts">
import { computed, useSlots } from 'vue'

import { useOnline } from '@/core/network/use-online'

// A message about the whole form, above or next to its button, or about a group whose data did
// not load. Tones: 'warn' for what could not load or send (network, server, slowness), 'bad' for
// what the server refused (credentials, an order that can no longer be cancelled), 'info' for
// the rest. 'warn' and 'bad' are announced at once. Listening for `retry` adds the one inline
// "Reintentar"; the `actions` slot holds any other way out, beside it, drawn the same. The
// default slot adds to the text.
const props = defineProps<{
  tone: 'bad' | 'warn' | 'info'
  title: string
  text?: string
  /** A retry is on its way: the button takes no more presses. */
  retrying?: boolean
  onRetry?: () => void
}>()

const slots = useSlots()

// Without network there is nothing to retry: it comes back on its own when the network does.
const online = useOnline()
const canRetry = computed(() => !!props.onRetry && online.value)
const hasActions = computed(() => canRetry.value || !!slots.actions)
const isWarning = computed(() => props.tone !== 'info')
</script>

<template>
  <div class="form-alert" :class="`form-alert--${tone}`" :role="isWarning ? 'alert' : undefined">
    <svg
      class="form-alert__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      :data-icon="isWarning ? 'warn' : 'info'"
    >
      <template v-if="isWarning">
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
          <strong class="form-alert__title">{{ title }}</strong>
          <span v-if="text" class="form-alert__text">{{ text }}</span>
        </p>
        <slot />
      </div>
      <div v-if="hasActions" class="form-alert__actions">
        <slot name="actions" />
        <button
          v-if="canRetry"
          type="button"
          class="form-alert__out"
          :disabled="retrying"
          :aria-busy="retrying ? 'true' : undefined"
          @click="onRetry?.()"
        >
          Reintentar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Sign, text in two lines, way out on the right. The way out drops under the text, lined up with
   it, only when both do not fit side by side. */
.form-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--tt-space-2);
  padding: var(--tt-space-3) var(--tt-space-3) var(--tt-space-3) var(--tt-space-4);
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

.form-alert--warn {
  background: var(--tt-warning-soft);
  color: var(--tt-warning-ink);
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
  gap: var(--tt-space-2) var(--tt-space-3);
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

.form-alert p {
  margin: 0;
}

.form-alert__title {
  display: block;
  font-weight: var(--tt-type-heading-m-weight);
}

.form-alert__text {
  display: block;
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
  opacity: 0.86;
}

.form-alert__actions {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--tt-space-2);
}

/* The way out is a pill on the surface, edged in the tone's own colour. */
.form-alert__out,
.form-alert__actions :slotted(a),
.form-alert__actions :slotted(button) {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  block-size: var(--tt-control-s);
  padding: 0 var(--tt-space-3);
  border: 0;
  border-radius: var(--tt-radius-pill);
  background: var(--tt-surface);
  box-shadow: inset 0 0 0 thin color-mix(in srgb, currentColor 28%, transparent);
  color: inherit;
  font: inherit;
  font-size: var(--tt-type-caption-size);
  font-weight: var(--tt-type-heading-m-weight);
  line-height: var(--tt-type-caption-line);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}

/* A finger's room for each way out, reaching past the pill instead of growing the box. */
.form-alert__out::after,
.form-alert__actions :slotted(a)::after,
.form-alert__actions :slotted(button)::after {
  content: '';
  position: absolute;
  inset-block: calc((var(--tt-control-s) - var(--tt-control-m)) / 2);
  inset-inline: 0;
}

.form-alert__out:disabled {
  cursor: progress;
  opacity: 0.6;
}

.form-alert__body :deep(a) {
  color: inherit;
  font-weight: var(--tt-type-heading-m-weight);
}
</style>
