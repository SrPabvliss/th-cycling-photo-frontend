<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NAlert, NButton, NDivider, NIcon } from 'naive-ui'
import { ArrowBack, CheckmarkCircle, ChevronBack, LogoWhatsapp } from '@vicons/ionicons5'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { useAuth } from '@/features/auth/composables/use-auth'
import { useCartStore } from '../../stores/cart.store'
import { useMergeCart } from '../../composables/mutations/use-merge-cart'
import { useCheckout } from '../../composables/mutations/use-checkout'
import type { ICheckoutOrderResult } from '../../types/requests/cart.request'
import CheckoutSummary from '../components/CheckoutSummary/CheckoutSummary.vue'
import { useCartPricing } from '../../composables/use-cart-pricing'
import PricingTotalBlock from '@/features/pricing/presentation/components/PricingTotalBlock/PricingTotalBlock.vue'

const router = useRouter()
const cartStore = useCartStore()
const { isAuthenticated } = useAuth()
const { mutateAsync: mergeCart } = useMergeCart()
const { mutateAsync: checkout, isPending: isCheckingOut } = useCheckout()
const cartPricing = useCartPricing()

const orderResults = ref<ICheckoutOrderResult[] | null>(null)

async function handleConfirm() {
  if (!isAuthenticated.value) {
    router.push({ path: '/login', query: { redirect: '/checkout' } })
    return
  }

  try {
    await mergeCart()
  } catch {
    /* already merged */
  }

  const items = cartStore.groups.map((g) => ({ eventId: g.eventId }))
  orderResults.value = await checkout({ items })
}
</script>

<template>
  <PublicLayout>
    <!-- Success (reuses OrderConfirmation design) -->
    <div v-if="orderResults" class="state-page">
      <div class="state-page__content">
        <div class="state-page__hero">
          <span class="state-page__code">OK</span>
          <div class="state-page__icon state-page__icon--success">
            <NIcon :component="CheckmarkCircle" :size="64" color="#fff" />
          </div>
        </div>

        <h1 class="state-page__title">¡Pedido recibido!</h1>
        <p class="state-page__description">
          Se {{ orderResults.length === 1 ? 'registró' : 'registraron' }}
          <strong
            >{{ orderResults.length }} pedido{{ orderResults.length !== 1 ? 's' : '' }}</strong
          >
          correctamente. Te contactaremos pronto por WhatsApp.
        </p>

        <div class="checkout-order-list">
          <div v-for="order in orderResults" :key="order.orderId" class="checkout-order-item">
            <span class="checkout-order-item__name">{{ order.eventName }}</span>
            <span class="checkout-order-item__count">{{ order.photoCount }} fotos</span>
          </div>
        </div>

        <div class="state-page__actions">
          <NButton type="primary" size="large" @click="router.push('/gallery')">
            <template #icon><NIcon :component="ArrowBack" /></template>
            Volver a la galería
          </NButton>
        </div>
      </div>
      <div class="state-page__mountain" />
    </div>

    <!-- Checkout summary -->
    <template v-else>
      <div class="cf-back-bar">
        <a class="cf-back-link" @click="router.back()">
          <NIcon :component="ChevronBack" :size="14" />
          Volver
        </a>
        <span class="cf-breadcrumb-sep">/</span>
        <span class="cf-breadcrumb-cur">Confirmar pedido</span>
      </div>

      <div v-if="cartStore.totalCount === 0" class="checkout-empty">
        <h2 class="checkout-empty__title">Tu carrito está vacío</h2>
        <NButton type="primary" @click="router.push('/gallery')">Explorar eventos</NButton>
      </div>

      <section v-else class="checkout-summary">
        <header class="checkout-summary__header">
          <h1 class="checkout-summary__title">Resumen del pedido</h1>
          <p class="checkout-summary__subtitle">
            Revisa las fotos que vas a pedir. Si todo está bien, confirma tu pedido.
          </p>
        </header>

        <div class="checkout-summary__layout">
          <div class="checkout-summary__main">
            <CheckoutSummary
              v-for="group in cartStore.groups"
              :key="group.eventId"
              :group="group"
              :unit-price="cartPricing.preview.value?.unitPrice ?? 0"
              :base-price="cartPricing.basePrice.value"
              :currency="cartPricing.currency.value"
              :is-loading="cartPricing.isLoading.value"
            />
          </div>

          <aside class="checkout-summary__aside">
            <div class="checkout-summary__panel">
              <NAlert type="info" :show-icon="true" class="checkout-summary__notice">
                <template #icon>
                  <NIcon :component="LogoWhatsapp" />
                </template>
                <strong>Nos contactaremos por WhatsApp</strong>
                para coordinar el pago y la entrega de tus fotos.
              </NAlert>

              <NDivider class="checkout-summary__divider" />

              <div class="checkout-summary__totals">
                <PricingTotalBlock
                  v-if="cartPricing.preview.value"
                  emphasis="soft"
                  :quantity="cartPricing.preview.value.quantity"
                  :subtotal="cartPricing.preview.value.subtotal"
                  :unit-price="cartPricing.preview.value.unitPrice"
                  :currency="cartPricing.currency.value"
                  :tier="cartPricing.preview.value.tier"
                  :next-tier="cartPricing.preview.value.nextTier"
                  :photos-to-next-tier="cartPricing.preview.value.photosToNextTier"
                  :is-loading="cartPricing.isLoading.value"
                />
                <div v-else class="checkout-summary__totals-loading">Calculando precio…</div>
              </div>

              <NButton
                type="primary"
                size="large"
                block
                :loading="isCheckingOut"
                :disabled="isCheckingOut || cartPricing.isLoading.value"
                @click="handleConfirm"
              >
                Confirmar pedido
              </NButton>

              <NButton quaternary size="medium" block @click="router.push('/gallery')">
                Seguir explorando
              </NButton>
            </div>
          </aside>
        </div>
      </section>
    </template>
  </PublicLayout>
</template>

<style
  src="@/features/client-gallery/presentation/components/OrderConfirmation/order-confirmation.css"
></style>
<style scoped src="./checkout-view.css" />
