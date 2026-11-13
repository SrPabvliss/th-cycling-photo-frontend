<script setup lang="ts">
import { CLIENT_DESTINATIONS } from './client-destinations'
import { useClientShell } from './client-shell'

// Mobile navigation of the client area. The layout mounts it only on the routes that ask for it;
// from desktop on it is hidden and the header carries the same three links.
const shell = useClientShell()
</script>

<template>
  <nav class="client-tab-bar" aria-label="Navegación principal">
    <RouterLink
      v-for="destination in CLIENT_DESTINATIONS"
      :key="destination.tab"
      class="client-tab-bar__link"
      :to="destination.to"
      :aria-current="shell.tab === destination.tab ? 'page' : undefined"
    >
      <svg class="client-tab-bar__icon" viewBox="0 0 24 24" aria-hidden="true">
        <template v-if="destination.tab === 'home'">
          <path
            class="client-tab-bar__fill"
            d="M3 10a2 2 0 0 1 .7-1.53l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
          />
          <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
        </template>
        <template v-else-if="destination.tab === 'events'">
          <path d="M5 22V3" />
          <path class="client-tab-bar__fill" d="M5 4h14v9H5" />
          <rect class="client-tab-bar__check" x="5" y="4" width="4.67" height="4.5" />
          <rect class="client-tab-bar__check" x="14.33" y="4" width="4.67" height="4.5" />
          <rect class="client-tab-bar__check" x="9.67" y="8.5" width="4.67" height="4.5" />
        </template>
        <template v-else>
          <path d="M3 7v12a2 2 0 0 0 2 2h12" />
          <rect class="client-tab-bar__fill" x="7" y="3" width="14" height="14" rx="2" />
          <circle cx="11.5" cy="7.5" r="1.5" />
          <path d="m21 12-3-3-7 7" />
        </template>
      </svg>
      {{ destination.label }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.client-tab-bar {
  position: fixed;
  inset-inline: 0;
  inset-block-end: 0;
  z-index: var(--tt-layer-tab-bar);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  /* Border included: the layout reserves exactly this height under the page. */
  box-sizing: border-box;
  block-size: calc(var(--tt-tabbar-height) + env(safe-area-inset-bottom));
  padding-inline: var(--tt-space-2);
  padding-block-end: env(safe-area-inset-bottom);
  border-block-start: thin solid var(--tt-line);
  background: var(--tt-surface-raised);
  font-family: var(--tt-font-sans);
}

.client-tab-bar__link {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(var(--tt-space-1) * 3 / 4);
  color: var(--tt-ink-muted);
  text-decoration: none;
  font-size: var(--tt-type-count-size);
  line-height: var(--tt-type-count-line);
  font-weight: var(--tt-type-title-weight);
}

.client-tab-bar__link[aria-current='page'] {
  color: var(--tt-primary-ink);
}

.client-tab-bar__link[aria-current='page']::before {
  content: '';
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: calc(50% - var(--tt-tab-indicator-w) / 2);
  inline-size: var(--tt-tab-indicator-w);
  block-size: var(--tt-tab-indicator-h);
  border-radius: 0 0 var(--tt-tab-indicator-h) var(--tt-tab-indicator-h);
  background: var(--tt-primary);
}

.client-tab-bar__icon {
  inline-size: var(--tt-icon-xl);
  block-size: var(--tt-icon-xl);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.client-tab-bar__check {
  fill: currentColor;
  stroke: none;
}

.client-tab-bar__fill {
  fill: transparent;
}

.client-tab-bar__link[aria-current='page'] .client-tab-bar__fill {
  fill: var(--tt-primary-soft);
}

@media (min-width: 768px) {
  .client-tab-bar {
    display: none;
  }
}
</style>
