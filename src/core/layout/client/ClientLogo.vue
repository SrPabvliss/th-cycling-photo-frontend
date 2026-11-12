<script setup lang="ts">
import helmetDarkUrl from '@/assets/brand/helmet-dark.svg'
import helmetLightUrl from '@/assets/brand/helmet-light.svg'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
</script>

<template>
  <RouterLink class="client-logo" :to="ROUTE_PATHS.LANDING" aria-label="Titan TV, inicio">
    <img class="client-logo__mark client-logo__mark--light" :src="helmetLightUrl" alt="" />
    <img class="client-logo__mark client-logo__mark--dark" :src="helmetDarkUrl" alt="" />
    TITAN TV
  </RouterLink>
</template>

<style scoped>
.client-logo {
  display: flex;
  align-items: center;
  gap: var(--tt-space-2);
  color: var(--tt-ink);
  text-decoration: none;
  font-family: var(--tt-type-wordmark-family);
  font-stretch: var(--tt-display-stretch);
  font-size: var(--tt-type-wordmark-size);
  line-height: var(--tt-type-wordmark-line);
  font-weight: var(--tt-type-wordmark-weight);
  letter-spacing: var(--tt-type-wordmark-tracking);
  white-space: nowrap;
}

.client-logo__mark {
  inline-size: var(--tt-logo-mark);
  block-size: var(--tt-logo-mark);
}

/* The scheme lives on the root element (color-scheme.store.ts): one helmet per scheme. */
.client-logo__mark--dark,
:global([data-tt-scheme='dark']) .client-logo__mark--light {
  display: none;
}

:global([data-tt-scheme='dark']) .client-logo__mark--dark {
  display: block;
}

@media (min-width: 768px) {
  .client-logo {
    font-size: var(--tt-type-wordmark-desktop-size);
  }

  .client-logo__mark {
    inline-size: var(--tt-logo-mark-desktop);
    block-size: var(--tt-logo-mark-desktop);
  }
}
</style>
