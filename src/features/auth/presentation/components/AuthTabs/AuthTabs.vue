<script setup lang="ts">
import { computed } from 'vue'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'

// Sign in / sign up switch. Links (they can be opened and shared) that keep the way back to the
// order and replace the history entry: going back does not bounce between the two.
const props = defineProps<{
  current: 'login' | 'register'
  redirect?: string | null
}>()

const query = computed(() => (props.redirect ? { redirect: props.redirect } : {}))
const TABS = [
  { key: 'login', text: 'Iniciar sesión', path: ROUTE_PATHS.LOGIN },
  { key: 'register', text: 'Crear cuenta', path: ROUTE_PATHS.REGISTER },
] as const
</script>

<template>
  <nav class="auth-tabs" role="tablist" aria-label="Acceso">
    <RouterLink
      v-for="tab in TABS"
      :key="tab.key"
      :to="{ path: tab.path, query }"
      replace
      role="tab"
      class="auth-tabs__tab tt-hit-area"
      :aria-selected="current === tab.key ? 'true' : 'false'"
    >
      {{ tab.text }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: var(--tt-space-1);
  border-radius: var(--tt-radius-m);
  background: var(--tt-surface-sunken);
  font-family: var(--tt-font-sans);
}

.auth-tabs__tab {
  display: flex;
  align-items: center;
  justify-content: center;
  min-block-size: calc(var(--tt-control-m) - var(--tt-space-1));
  border-radius: calc(var(--tt-radius-m) - var(--tt-space-1));
  color: var(--tt-ink-muted);
  text-decoration: none;
  font-size: var(--tt-type-body-s-size);
  font-weight: var(--tt-type-title-weight);
}

.auth-tabs__tab[aria-selected='true'] {
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  box-shadow: var(--tt-shadow-1);
}

.auth-tabs__tab:focus-visible {
  outline: medium solid var(--tt-primary);
  outline-offset: calc(var(--tt-space-1) / -2);
}
</style>
