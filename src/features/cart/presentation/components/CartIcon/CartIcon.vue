<script setup lang="ts">
import { useCartStore } from '../../../stores/cart.store'

const cartStore = useCartStore()

defineEmits<{ click: [] }>()
</script>

<template>
  <button class="cart-icon-btn" @click="$emit('click')" aria-label="Carrito">
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
    <span v-if="cartStore.totalCount > 0" class="cart-icon-badge">
      {{ cartStore.totalCount > 99 ? '99+' : cartStore.totalCount }}
    </span>
  </button>
</template>

<style scoped>
.cart-icon-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-icon-badge {
  position: absolute;
  top: -7px;
  right: -7px;
  background: var(--titan-paper, #fbfaf6);
  color: var(--titan-ink, #0a0f14);
  border: 1.5px solid var(--titan-ink, #0a0f14);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  padding: 0 3px;
  line-height: 1;
}
</style>
