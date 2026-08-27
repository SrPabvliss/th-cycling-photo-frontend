<script setup lang="ts">
import { NIcon, NBadge } from 'naive-ui'
import { CartOutline } from '@vicons/ionicons5'

import { useCartStore } from '@/shared/stores/cart.store'

const cartStore = useCartStore()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button class="cart-icon" @click="emit('click')">
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
