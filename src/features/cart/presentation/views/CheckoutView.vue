<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import { ArrowBack, CheckmarkCircle, ChevronBack } from '@vicons/ionicons5'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { useAuth } from '@/features/auth/composables/use-auth'
import { useCartStore } from '../../stores/cart.store'
import { useMergeCart } from '../../composables/mutations/use-merge-cart'
import { useCheckout } from '../../composables/mutations/use-checkout'
import { useCheckoutStepper, type IEventFormData } from '../../composables/use-checkout-stepper'
import type { ICheckoutEventItem, ICheckoutOrderResult } from '../../types/requests/cart.request'
import CheckoutStepper from '../components/CheckoutStepper/CheckoutStepper.vue'
import CheckoutEventSection from '../components/CheckoutEventSection/CheckoutEventSection.vue'

const router = useRouter()
const cartStore = useCartStore()
const { isAuthenticated } = useAuth()
const { mutateAsync: mergeCart } = useMergeCart()
const { mutateAsync: checkout, isPending: isCheckingOut } = useCheckout()

const {
  currentStep,
  totalSteps,
  currentGroup,
  isLastStep,
  getForm,
  isStepComplete,
  validateCurrent,
  goNext,
  goPrev,
  handleTabClick,
  eventForms,
} = useCheckoutStepper()

function handleFormUpdate(eventId: string, form: IEventFormData) {
  eventForms.value.set(eventId, form)
}

const orderResults = ref<ICheckoutOrderResult[] | null>(null)

async function handleCheckout() {
  if (!validateCurrent()) return

  if (!isAuthenticated.value) {
    router.push({ path: '/login', query: { redirect: '/checkout' } })
    return
  }

  try {
    await mergeCart()
  } catch {
    /* already merged */
  }

  const items: ICheckoutEventItem[] = cartStore.groups.map((g) => {
    const form = getForm(g.eventId)
    return {
      eventId: g.eventId,
      bibNumber: form.bibNumber || undefined,
      snapCategoryName: form.categoryName || undefined,
    }
  })

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

    <!-- Checkout wizard -->
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

      <template v-else>
        <CheckoutStepper
          :groups="cartStore.groups"
          :current-step="currentStep"
          :is-step-complete="isStepComplete"
          @tab-click="handleTabClick"
        />

        <CheckoutEventSection
          v-if="currentGroup"
          :group="currentGroup"
          :form="getForm(currentGroup.eventId)"
          :is-first="currentStep === 0"
          :is-last="isLastStep"
          :total-steps="totalSteps"
          :is-checking-out="isCheckingOut"
          @update:form="(f) => handleFormUpdate(currentGroup!.eventId, f)"
          @prev="goPrev"
          @next="goNext"
          @checkout="handleCheckout"
        />
      </template>
    </template>
  </PublicLayout>
</template>

<style src="@/features/client-gallery/presentation/components/ContactForm/contact-form.css"></style>
<style
  src="@/features/client-gallery/presentation/components/OrderSummary/order-summary.css"
></style>
<style
  src="@/features/client-gallery/presentation/components/OrderConfirmation/order-confirmation.css"
></style>
<style scoped src="./checkout-view.css" />
