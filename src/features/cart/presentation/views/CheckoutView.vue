<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NDivider, NIcon } from 'naive-ui'
import { ArrowBack, CheckmarkCircle, ChevronBack } from '@vicons/ionicons5'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { checkoutPath } from '@/core/navigation/route-paths'
import { useAuth } from '@/features/auth/composables/use-auth'
import PaymentMethodModal from '@/shared/components/PaymentMethodModal/PaymentMethodModal.vue'
import { useCartStore } from '@/shared/stores/cart.store'
import type { ICheckoutOrderResult } from '@/shared/types/cart.types'
import { useMergeCart } from '../../composables/mutations/use-merge-cart'
import CheckoutSummary from '../components/CheckoutSummary/CheckoutSummary.vue'
import { useCartPricing } from '../../composables/use-cart-pricing'
import PricingTotalBlock from '@/features/pricing/presentation/components/PricingTotalBlock/PricingTotalBlock.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const { isAuthenticated } = useAuth()
const { mutateAsync: mergeCart, isPending: isMerging } = useMergeCart()

const eventId = computed(() => route.params.eventId as string)

watch(
  eventId,
  (id) => {
    if (id) cartStore.setActiveEvent(id)
  },
  { immediate: true },
)

const checkoutGroup = computed(
  () => cartStore.groups.find((group) => group.eventId === eventId.value) ?? null,
)
const checkoutCount = computed(() => checkoutGroup.value?.photos.length ?? 0)
const cartPricing = useCartPricing(checkoutCount)

const orderResults = ref<ICheckoutOrderResult[] | null>(null)
const showMethodModal = ref(false)

async function handleConfirm() {
  if (!eventId.value) return

  if (!isAuthenticated.value) {
    router.push({ path: '/login', query: { redirect: checkoutPath(eventId.value) } })
    return
  }

  try {
    await mergeCart()
  } catch {
    /* already merged */
  }

  showMethodModal.value = true
}

function handlePaidOrders(orders: ICheckoutOrderResult[]) {
  orderResults.value = orders
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
          correctamente. Completa el pago para recibir tus fotos.
        </p>

        <div class="checkout-order-list">
          <div v-for="order in orderResults" :key="order.orderId" class="checkout-order-item">
            <span class="checkout-order-item__name">{{ order.eventName }}</span>
            <span class="checkout-order-item__count">{{ order.photoCount }} fotos</span>
          </div>
        </div>

        <div class="checkout-payment-actions">
          <p class="checkout-transfer-notice">
            Te enviaremos los datos para la transferencia. Apenas confirmemos el pago recibirás tus
            fotos.
          </p>
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

      <div v-if="!checkoutGroup" class="checkout-empty">
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
              :group="checkoutGroup"
              :unit-price="cartPricing.preview.value?.unitPrice ?? 0"
              :base-price="cartPricing.basePrice.value"
              :currency="cartPricing.currency.value"
              :is-loading="cartPricing.isLoading.value"
            />
          </div>

          <aside class="checkout-summary__aside">
            <div class="checkout-summary__panel">
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
                :loading="isMerging"
                :disabled="isMerging || cartPricing.isLoading.value"
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

      <PaymentMethodModal
        v-model:show="showMethodModal"
        :event-id="eventId"
        :total="cartPricing.subtotal.value"
        :currency="cartPricing.currency.value"
        @paid-orders="handlePaidOrders"
      />
    </template>
  </PublicLayout>
</template>

<style src="./checkout-success.css"></style>
<style scoped src="./checkout-view.css" />
