<script setup lang="ts">
import { NButton } from 'naive-ui'

withDefaults(
  defineProps<{
    title?: string
    text?: string
    /** A retry is on its way: the button shows it and takes no more presses. */
    retrying?: boolean
  }>(),
  {
    title: 'No pudimos cargar esto',
    text: 'Puede ser tu conexión.',
    retrying: false,
  },
)

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="error-state" role="alert">
    <p class="error-state__title">{{ title }}</p>
    <p class="error-state__text">{{ text }}</p>
    <NButton
      class="error-state__retry"
      type="primary"
      :loading="retrying"
      :disabled="retrying"
      @click="emit('retry')"
    >
      Reintentar
    </NButton>
  </div>
</template>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--tt-space-2);
  padding: var(--tt-space-6) var(--tt-space-4);
  text-align: center;
}

.error-state__title {
  margin: 0;
  color: var(--tt-ink);
  font-family: var(--tt-type-title-family);
  font-size: var(--tt-type-title-size);
  line-height: var(--tt-type-title-line);
  font-weight: var(--tt-type-title-weight);
}

.error-state__text {
  margin: 0;
  color: var(--tt-ink-muted);
  font-family: var(--tt-type-body-family);
  font-size: var(--tt-type-body-size);
  line-height: var(--tt-type-body-line);
  font-weight: var(--tt-type-body-weight);
}

.error-state__retry {
  margin-block-start: var(--tt-space-3);
}
</style>
