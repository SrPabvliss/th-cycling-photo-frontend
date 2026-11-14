<script lang="ts">
/** How long "Conexión restablecida" stays before the strip goes. */
export const BACK_ONLINE_MS = 2000
</script>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

import { useOnline } from '@/core/network/use-online'

// The one place that says the whole app has no network, under the header. Its live region is
// always there, empty while online, so the change is announced. Sections and alerts
// do not repeat it: they wait without a button, and loads resume on their own when it is back.
defineProps<{
  /** Sticks right under the sticky header instead of at the top of the page. */
  underHeader?: boolean
}>()

const online = useOnline()

type StripState = 'hidden' | 'offline' | 'back'
const state = ref<StripState>(online.value ? 'hidden' : 'offline')
let timer: ReturnType<typeof setTimeout> | undefined

watch(online, (isOnline) => {
  clearTimeout(timer)
  if (!isOnline) {
    state.value = 'offline'
    return
  }
  if (state.value !== 'offline') return
  state.value = 'back'
  timer = setTimeout(() => {
    state.value = 'hidden'
  }, BACK_ONLINE_MS)
})

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div
    class="offline-strip"
    :class="{
      'offline-strip--open': state !== 'hidden',
      'offline-strip--back': state === 'back',
      'offline-strip--under-header': underHeader,
    }"
    role="status"
  >
    <div class="offline-strip__clip">
      <p v-if="state === 'offline'" class="offline-strip__line">
        <svg class="offline-strip__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M2 2l20 20M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 5.2-2.7M19 12.9a10 10 0 0 0-2.1-1.5M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8a15 15 0 0 0-11.3-3.7M12 20h.01"
          />
        </svg>
        Sin conexión. Estás viendo lo último que se cargó.
      </p>
      <p v-else-if="state === 'back'" class="offline-strip__line">
        <svg class="offline-strip__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Conexión restablecida
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Opens by its own height, so the content under it moves down smoothly instead of jumping. */
.offline-strip {
  position: sticky;
  inset-block-start: var(--offline-strip-top, 0);
  z-index: var(--tt-layer-header);
  display: grid;
  grid-template-rows: 0fr;
  background: var(--tt-navy);
  color: var(--tt-on-navy);
  font-family: var(--tt-font-sans);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
  font-weight: var(--tt-type-caption-weight);
  transition:
    grid-template-rows var(--tt-motion-base) var(--tt-easing-standard),
    background-color var(--tt-motion-base) var(--tt-easing-standard);
}

.offline-strip--open {
  grid-template-rows: 1fr;
}

.offline-strip--back {
  background: var(--tt-success-soft);
  color: var(--tt-success-ink);
}

.offline-strip__clip {
  overflow: hidden;
  min-block-size: 0;
}

.offline-strip__line {
  display: flex;
  align-items: center;
  gap: var(--tt-space-2);
  margin: 0;
  padding: var(--tt-space-2) var(--tt-space-4);
}

.offline-strip__icon {
  flex: none;
  inline-size: var(--tt-icon-s);
  block-size: var(--tt-icon-s);
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Under the sticky header, when there is one: it sticks right below it. Media queries cannot
 * read custom properties, so the breakpoint is written out: desktop starts at 768, as in the
 * rest of the app. */
.offline-strip.offline-strip--under-header {
  --offline-strip-top: var(--tt-header-mobile);
}

@media (min-width: 768px) {
  .offline-strip.offline-strip--under-header {
    --offline-strip-top: var(--tt-header-desktop);
  }
}

@media (prefers-reduced-motion: reduce) {
  .offline-strip {
    transition: none;
  }
}
</style>
