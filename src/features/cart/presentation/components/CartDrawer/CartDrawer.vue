<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NAlert, NButton, NDrawer, NDrawerContent, NEmpty, NFlex, NIcon } from 'naive-ui'
import { CloseCircleOutline, CartOutline, LogInOutline } from '@vicons/ionicons5'

import { checkoutPath } from '@/core/navigation/route-paths'
import { getGalleryUrl } from '@/shared/utils/cdn.utils'
import PhotoLightbox from '@/shared/components/PhotoLightbox/PhotoLightbox.vue'
import { useLightbox } from '@/shared/composables/use-lightbox'
import type { ICartPhoto } from '../../../types/responses/cart.response'
import { useAuth } from '@/features/auth/composables/use-auth'
import { useCartStore } from '@/shared/stores/cart.store'
import { useRemoveFromCart } from '../../../composables/mutations/use-remove-from-cart'
import { useCartPricing } from '@/features/cart/composables/use-cart-pricing'
import PricingTotalBlock from '@/features/pricing/presentation/components/PricingTotalBlock/PricingTotalBlock.vue'
import PhotoPriceStrip from '@/features/pricing/presentation/components/PhotoPriceStrip/PhotoPriceStrip.vue'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const router = useRouter()
const cartStore = useCartStore()
const { isAuthenticated } = useAuth()
const { mutate: removeFromCart } = useRemoveFromCart()

const checkoutEventId = computed(() => {
  const active = cartStore.activeEventId
  if (active && cartStore.groups.some((group) => group.eventId === active)) return active
  return cartStore.groups[0]?.eventId ?? null
})

const checkoutGroup = computed(
  () => cartStore.groups.find((group) => group.eventId === checkoutEventId.value) ?? null,
)
const checkoutCount = computed(() => checkoutGroup.value?.photos.length ?? 0)
const cartPricing = useCartPricing(checkoutCount)

const {
  photos: lightboxPhotos,
  index: lightboxIndex,
  show: showLightbox,
  open: openLightbox,
} = useLightbox<ICartPhoto>()

function resolveCheckoutPath(): string | null {
  return checkoutEventId.value ? checkoutPath(checkoutEventId.value) : null
}

function goToCheckout() {
  const path = resolveCheckoutPath()
  if (!path) return
  emit('update:show', false)
  router.push(path)
}

function goToLogin() {
  const path = resolveCheckoutPath()
  if (!path) return
  emit('update:show', false)
  router.push({ path: '/login', query: { redirect: path } })
}
</script>

<template>
  <NDrawer :show="show" :width="420" placement="right" @update:show="emit('update:show', $event)">
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
              <div v-for="(photo, index) in group.photos" :key="photo.id" class="cart-card">
                <div class="cart-thumb">
                  <img
                    :src="getGalleryUrl(photo.publicSlug)"
                    alt=""
                    loading="lazy"
                    @click="openLightbox(group.photos, index)"
                  />
                  <button class="cart-thumb__remove" @click.stop="removeFromCart(photo.id)">
                    <NIcon :component="CloseCircleOutline" :size="12" />
                  </button>
                </div>
                <PhotoPriceStrip
                  v-if="cartPricing.preview.value"
                  :unit-price="cartPricing.preview.value.unitPrice"
                  :base-price="cartPricing.basePrice.value"
                  :currency="cartPricing.currency.value"
                  :is-loading="cartPricing.isLoading.value"
                />
              </div>
            </div>
          </div>
        </NFlex>
      </template>

      <template v-if="cartStore.totalCount > 0" #footer>
        <NFlex vertical :size="10" style="width: 100%">
          <div
            v-if="cartStore.totalCount > 0 && cartPricing.preview.value"
            class="cart-drawer__pricing"
          >
            <PricingTotalBlock
              :quantity="cartPricing.preview.value.quantity"
              :subtotal="cartPricing.preview.value.subtotal"
              :unit-price="cartPricing.preview.value.unitPrice"
              :currency="cartPricing.currency.value"
              :tier="cartPricing.preview.value.tier"
              :next-tier="cartPricing.preview.value.nextTier"
              :photos-to-next-tier="cartPricing.preview.value.photosToNextTier"
              :is-loading="cartPricing.isLoading.value"
            />
          </div>
          <div
            v-else-if="cartPricing.isLoading.value"
            class="cart-drawer__pricing cart-drawer__pricing--loading"
          >
            Calculando precio…
          </div>

          <template v-if="isAuthenticated">
            <NButton
              type="primary"
              block
              size="large"
              :disabled="!checkoutEventId"
              @click="goToCheckout"
            >
              Ir al checkout
            </NButton>
          </template>
          <template v-else>
            <NAlert type="info" :show-icon="true" style="font-size: 13px">
              Inicia sesión para completar tu pedido.
            </NAlert>
            <NButton
              type="primary"
              block
              size="large"
              :disabled="!checkoutEventId"
              @click="goToLogin"
            >
              <template #icon><NIcon :component="LogInOutline" /></template>
              Iniciar sesión para continuar
            </NButton>
          </template>
        </NFlex>
      </template>
    </NDrawerContent>
  </NDrawer>

  <PhotoLightbox
    :photos="lightboxPhotos"
    :initial-index="lightboxIndex"
    :show="showLightbox"
    @update:show="showLightbox = $event"
  />
</template>

<style scoped src="./cart-drawer.css" />
