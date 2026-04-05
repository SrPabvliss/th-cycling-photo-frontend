<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NDrawer, NDrawerContent, NEmpty, NFlex, NIcon } from 'naive-ui'
import { CloseCircleOutline, CartOutline } from '@vicons/ionicons5'

import { useCartStore } from '../../../stores/cart.store'
import { useRemoveFromCart } from '../../../composables/mutations/use-remove-from-cart'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const router = useRouter()
const cartStore = useCartStore()
const { mutate: removeFromCart } = useRemoveFromCart()

function goToCheckout() {
  emit('update:show', false)
  router.push('/checkout')
}
</script>

<template>
  <NDrawer :show="show" :width="380" placement="right" @update:show="emit('update:show', $event)">
    <NDrawerContent title="Tu carrito" closable>
      <NEmpty
        v-if="cartStore.totalCount === 0"
        description="Tu carrito está vacío"
        style="padding: 40px 0"
      >
        <template #icon>
          <NIcon :component="CartOutline" :size="40" color="#d1d5db" />
        </template>
      </NEmpty>

      <template v-else>
        <NFlex vertical :size="16">
          <div v-for="group in cartStore.groups" :key="group.eventId" class="cart-group">
            <div class="cart-group__header">
              <span class="cart-group__event">{{ group.eventName }}</span>
              <span class="cart-group__count">{{ group.photos.length }} fotos</span>
            </div>

            <div class="cart-group__thumbs">
              <div v-for="photo in group.photos" :key="photo.id" class="cart-thumb">
                <img :src="photo.url" alt="" />
                <button class="cart-thumb__remove" @click="removeFromCart(photo.id)">
                  <NIcon :component="CloseCircleOutline" :size="12" />
                </button>
              </div>
            </div>
          </div>
        </NFlex>
      </template>

      <template v-if="cartStore.totalCount > 0" #footer>
        <NFlex vertical :size="8" style="width: 100%">
          <div class="cart-summary">
            <span>Total:</span>
            <strong
              >{{ cartStore.totalCount }} fotos de {{ cartStore.eventCount }} evento{{
                cartStore.eventCount !== 1 ? 's' : ''
              }}</strong
            >
          </div>
          <NButton type="primary" block size="large" @click="goToCheckout">
            Ir al checkout
          </NButton>
        </NFlex>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped src="./cart-drawer.css" />
