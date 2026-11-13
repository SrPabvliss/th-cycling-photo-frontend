<script setup lang="ts">
// A message about the whole form, above or next to its button. 'bad' is announced at once.
defineProps<{
  tone: 'bad' | 'info'
  title: string
  text?: string
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

.form-alert :deep(a) {
  color: inherit;
  font-weight: var(--tt-type-title-weight);
}
</style>
