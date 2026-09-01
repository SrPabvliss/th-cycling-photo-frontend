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

const router = useRouter()
const cartStore = useCartStore()
const { isAuthenticated } = useAuth()
const { mutate: removeFromCart } = useRemoveFromCart()

// Mounted straight into a layout slot, so its open state lives in the store rather than in a prop
// the nav has no way to pass down.
function close() {
  cartStore.setDrawerOpen(false)
}

// Buying happens one event at a time: the volume discount and the checkout belong to a single
// event, so the drawer only prices the one being browsed. From anywhere else it is a list of
// shortcuts, with no event promoted over the others and nothing to pay for yet.
const checkoutGroup = computed(() => cartStore.activeGroup)
const checkoutEventId = computed(() => checkoutGroup.value?.eventId ?? null)
const checkoutCount = computed(() => checkoutGroup.value?.photos.length ?? 0)

const shortcuts = computed(() =>
  checkoutGroup.value === null ? cartStore.groups : cartStore.otherGroups,
)
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
  close()
  router.push(path)
}

function goToGallery(slug: string) {
  router.push(`/gallery/${slug}`)
}

function goToLogin() {
  const path = resolveCheckoutPath()
  if (!path) return
  close()
  router.push({ path: '/login', query: { redirect: path } })
}
</script>

<template>
  <NDrawer
    :show="cartStore.isDrawerOpen"
    :width="420"
    placement="right"
    @update:show="cartStore.setDrawerOpen($event)"
  >
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
        <NFlex vertical :size="18">
          <div v-if="checkoutGroup" class="cart-group">
            <div class="cart-group__header">
              <span class="cart-group__event">{{ checkoutGroup.eventName }}</span>
              <span class="cart-group__count">{{ checkoutGroup.photos.length }} fotos</span>
            </div>

            <div class="cart-group__thumbs">
              <div
                v-for="(photo, index) in checkoutGroup.photos"
                :key="photo.id"
                class="cart-card"
                data-test="cart-thumb"
              >
                <div class="cart-thumb">
                  <img
                    :src="getGalleryUrl(photo.publicSlug)"
                    alt=""
                    loading="lazy"
                    @click="openLightbox(checkoutGroup.photos, index)"
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

          <div v-if="shortcuts.length > 0" class="cart-shortcuts">
            <span class="cart-shortcuts__title">
              {{ checkoutGroup ? 'También guardaste fotos en' : 'Tus fotos guardadas' }}
            </span>
            <p class="cart-shortcuts__note">
              Cada evento se paga por separado. Entra al que quieras comprar.
            </p>

            <button
              v-for="group in shortcuts"
              :key="group.eventId"
              class="cart-shortcut"
              data-test="cart-shortcut"
              @click="goToGallery(group.eventSlug)"
            >
              <span class="cart-shortcut__name">{{ group.eventName }}</span>
              <span class="cart-shortcut__count">
                {{ group.photos.length }} foto{{ group.photos.length === 1 ? '' : 's' }}
              </span>
            </button>
          </div>
        </NFlex>
      </template>

      <template v-if="checkoutGroup" #footer>
        <NFlex vertical :size="10" style="width: 100%">
          <div
            v-if="cartPricing.preview.value"
            class="cart-drawer__pricing"
            data-test="cart-pricing"
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
              data-test="cart-checkout"
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
