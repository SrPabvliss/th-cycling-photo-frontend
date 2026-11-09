<script setup lang="ts">
import { NIcon, NBadge } from 'naive-ui'
import { CartOutline } from '@vicons/ionicons5'

import { useCartStore } from '@/shared/stores/cart.store'
import { useCartQuery } from '../../../composables/queries/use-cart'

const cartStore = useCartStore()

// The nav renders slot components on their own, so an emit has nobody listening and a prop nobody
// to set it: whatever this needs, it owns. Loading the cart used to live in PublicNavbar.
useCartQuery()
</script>

<template>
  <button class="cart-icon" @click="cartStore.setDrawerOpen(true)">
    <NBadge :value="cartStore.totalCount" :max="99" :offset="[-4, -4]">
      <NIcon :component="CartOutline" :size="22" />
    </NBadge>
  </button>
</template>

<style scoped>
.cart-icon {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  padding: 4px;
  display: flex;
  align-items: center;
}
</style>
