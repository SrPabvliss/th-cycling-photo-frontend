<script setup lang="ts">
import { EmptyState, type IllustrationKey } from '@/shared/components/empty-state'

// Frame of the status pages (404, 500, access denied): one centered empty state whose title is
// the title of the page.
defineProps<{
  illustration?: IllustrationKey
  title: string
  description: string
  /** Reference a person can quote to support, such as an incident id. */
  errorInfo?: string
}>()
</script>

<template>
  <div class="error-page">
    <EmptyState
      :illustration="illustration"
      :title="title"
      :text="description"
      :heading-level="1"
      problem
    >
      <template #actions>
        <slot name="actions" />
      </template>
    </EmptyState>

    <slot name="extra" />

    <p v-if="errorInfo" class="error-page__info">{{ errorInfo }}</p>
  </div>
</template>

<style scoped>
.error-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--tt-space-4);
  inline-size: 100%;
  max-inline-size: calc(var(--tt-ilu-inline) * 3);
  margin-inline: auto;
  padding: var(--tt-space-4) var(--tt-space-4) var(--tt-space-7);
}

.error-page :deep(.empty-state) {
  flex: none;
}

.error-page__info {
  margin: 0;
  color: var(--tt-ink-muted);
  font-family: var(--tt-font-sans);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
  text-align: center;
}
</style>
