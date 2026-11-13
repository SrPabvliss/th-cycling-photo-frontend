<script setup lang="ts">
import { computed } from 'vue'

// A labelled control with its hint and its error. The control comes in the slot and takes the
// slot props: its id, `aria-describedby` (error first, then hint) and `aria-invalid`.
const props = defineProps<{
  id: string
  label: string
  error?: string | null
  hint?: string
}>()

const errorId = computed(() => `${props.id}-error`)
const hintId = computed(() => `${props.id}-hint`)
const describedby = computed(
  () =>
    [props.error ? errorId.value : null, props.hint ? hintId.value : null]
      .filter(Boolean)
      .join(' ') || undefined,
)
</script>

<template>
  <div class="form-field" :class="{ 'form-field--error': !!error }">
    <label class="form-field__label" :for="id">{{ label }}</label>
    <slot :id="id" :describedby="describedby" :invalid="error ? true : undefined" />
    <em v-if="error" :id="errorId" class="form-field__error">{{ error }}</em>
    <small v-if="hint" :id="hintId" class="form-field__hint">{{ hint }}</small>
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-1);
  min-inline-size: 0;
  font-family: var(--tt-font-sans);
}

.form-field__label {
  color: var(--tt-ink);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
  font-weight: var(--tt-type-title-weight);
}

.form-field :slotted(input:not([type='checkbox']):not([type='radio'])),
.form-field :slotted(select) {
  inline-size: 100%;
  min-inline-size: 0;
  block-size: var(--tt-control-l);
  padding: 0 var(--tt-space-3);
  border: thin solid var(--tt-line);
  border-radius: var(--tt-radius-m);
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  font-family: inherit;
  font-size: var(--tt-type-title-size);
  outline: none;
}

.form-field :slotted(input:focus),
.form-field :slotted(select:focus) {
  border-color: var(--tt-primary);
  box-shadow: 0 0 0 var(--tt-space-1) var(--tt-primary-soft);
}

.form-field--error :slotted(input),
.form-field--error :slotted(select) {
  border-color: var(--tt-danger-ink);
}

.form-field :slotted(select:disabled) {
  opacity: 0.5;
}

.form-field__error,
.form-field__hint {
  font-style: normal;
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
}

.form-field__error {
  color: var(--tt-danger-ink);
}

.form-field__hint {
  color: var(--tt-ink-muted);
}
</style>
