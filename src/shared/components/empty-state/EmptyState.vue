<script setup lang="ts">
import { computed, ref } from 'vue'

import { useScreenProblem } from '@/core/layout/client/screen-problem'
import { ILLUSTRATION_VIEW_BOX, ILLUSTRATIONS, type IllustrationKey } from './illustrations'

const props = withDefaults(
  defineProps<{
    illustration?: IllustrationKey
    title: string
    text?: string
    /** 1 on the pages where this is the main title (404, 500); 2 inside a screen. */
    headingLevel?: 1 | 2
    /** It tells of a problem (a link that expired, a page that is not there), not of an empty list. */
    problem?: boolean
  }>(),
  { headingLevel: 2, problem: false },
)

const root = ref<HTMLElement | null>(null)
useScreenProblem(root, () => props.problem)

// The key may come from data at run time: one that does not exist draws nothing.
const drawing = computed(() =>
  props.illustration && Object.prototype.hasOwnProperty.call(ILLUSTRATIONS, props.illustration)
    ? ILLUSTRATIONS[props.illustration]
    : null,
)
</script>

<template>
  <div ref="root" class="empty-state">
    <!-- Markup generated from the design files by scripts/sync-illustrations.mjs, never user data. -->
    <!-- eslint-disable vue/no-v-html -->
    <svg
      v-if="drawing"
      class="empty-state__illustration"
      :viewBox="ILLUSTRATION_VIEW_BOX"
      fill="none"
      aria-hidden="true"
      v-html="drawing"
    />
    <!-- eslint-enable vue/no-v-html -->

    <component :is="`h${headingLevel}`" class="empty-state__title">{{ title }}</component>
    <p v-if="text" class="empty-state__text">{{ text }}</p>

    <div v-if="$slots.actions" class="empty-state__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--tt-space-2);
  padding: var(--tt-space-6) var(--tt-space-2);
  text-align: center;
  color: var(--tt-ink);
  font-family: var(--tt-font-sans);
}

.empty-state__illustration {
  inline-size: var(--tt-ilu-inline);
  aspect-ratio: 160 / 128;
}

.empty-state__title {
  margin: 0;
  font-size: var(--tt-type-heading-m-size);
  line-height: var(--tt-type-heading-m-line);
  font-weight: var(--tt-type-heading-m-weight);
}

.empty-state__text {
  max-inline-size: calc(var(--tt-ilu-inline) * 2);
  margin: 0;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-size);
  line-height: var(--tt-type-body-line);
}

.empty-state__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--tt-space-1);
  inline-size: 100%;
  max-inline-size: calc(var(--tt-ilu-inline) * 2);
  margin-block-start: var(--tt-space-2);
}
</style>
