<script setup lang="ts">
import { computed } from 'vue'

import { userInitial } from './user-initial'

const props = withDefaults(
  defineProps<{
    name?: string | null
    size?: 's' | 'm' | 'l'
  }>(),
  { name: null, size: 's' },
)

const initial = computed(() => userInitial(props.name))
</script>

<template>
  <span class="user-avatar" :class="`user-avatar--${size}`" aria-hidden="true">
    <template v-if="initial">{{ initial }}</template>
    <svg
      v-else
      class="user-avatar__person"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  </span>
</template>

<style scoped>
.user-avatar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--tt-control-s);
  block-size: var(--tt-control-s);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-primary);
  color: var(--tt-on-primary);
  font-family: var(--tt-font-sans);
  font-size: var(--tt-type-body-size);
  font-weight: var(--tt-type-title-weight);
  line-height: 1;
}

.user-avatar--m {
  inline-size: var(--tt-avatar-desktop);
  block-size: var(--tt-avatar-desktop);
}

.user-avatar--l {
  inline-size: calc(var(--tt-control-l) + var(--tt-space-3));
  block-size: calc(var(--tt-control-l) + var(--tt-space-3));
  font-size: var(--tt-type-heading-l-size);
}

.user-avatar__person {
  inline-size: var(--tt-icon-l);
  block-size: var(--tt-icon-l);
}
</style>
