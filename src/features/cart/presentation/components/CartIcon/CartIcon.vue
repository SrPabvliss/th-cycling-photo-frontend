<script setup lang="ts">
import { computed } from 'vue'

import { useCartState } from '@/shared/cart'
import { useCartStore } from '@/shared/stores/cart.store'

const cartStore = useCartStore()

// The nav renders slot components on their own, so an emit has nobody listening and a prop nobody
// to set it: whatever this needs, it owns. Reading the cart state also loads the cart.
const cart = useCartState()

// Only a cart that was read can be counted: while it loads, or after it failed, there is no number.
const count = computed(() => (cart.status.value === 'success' ? cart.totalCount.value : null))

const label = computed(() =>
  count.value === null
    ? 'Carrito'
    : `Carrito, ${count.value} ${count.value === 1 ? 'foto' : 'fotos'}`,
)
</script>

<template>
  <button
    type="button"
    class="cart-icon"
    :aria-label="label"
    @click="cartStore.setDrawerOpen(true)"
  >
    <svg
      class="cart-icon__glyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path
        class="cart-icon__basket"
        d="M6 8h15l-1.9 7.3a2 2 0 0 1-2 1.5H9.4a2 2 0 0 1-2-1.6Z"
        stroke="none"
      />
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
      <circle cx="10" cy="20" r="1.4" fill="currentColor" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" />
    </svg>
    <span v-if="count" class="cart-icon__badge" aria-hidden="true">
      {{ count > 99 ? '99+' : count }}
    </span>
  </button>
</template>

<style scoped>
.cart-icon {
  position: relative;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--tt-control-m);
  block-size: var(--tt-control-m);
  border: 0;
  border-radius: var(--tt-radius-pill);
  background: transparent;
  color: var(--tt-ink);
  cursor: pointer;
}

.cart-icon:hover {
  background: var(--tt-surface-sunken);
}

.cart-icon__glyph {
  inline-size: var(--tt-icon-xl);
  block-size: var(--tt-icon-xl);
}

.cart-icon__basket {
  fill: var(--tt-primary-soft);
}

.cart-icon__badge {
  position: absolute;
  inset-block-start: var(--tt-space-1);
  inset-inline-end: calc(var(--tt-space-1) / 2);
  min-inline-size: var(--tt-icon-m);
  block-size: var(--tt-icon-m);
  padding-inline: var(--tt-space-1);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-primary);
  color: var(--tt-on-primary);
  box-shadow: 0 0 0 calc(var(--tt-space-1) / 2) var(--tt-surface);
  font-family: var(--tt-font-sans);
  font-size: var(--tt-type-count-size);
  line-height: var(--tt-icon-m);
  font-weight: var(--tt-type-count-weight);
  text-align: center;
}
</style>
