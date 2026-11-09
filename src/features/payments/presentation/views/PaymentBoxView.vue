<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NAlert, NButton, NIcon, NSpin } from 'naive-ui'
import { ChevronBackOutline } from '@vicons/ionicons5'
import { isAxiosError } from 'axios'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { useCreatePaymentIntent } from '@/features/payments/composables/mutations/use-create-payment-intent'
import { findPaymentGateway } from '@/features/payments/gateways/registry'
import { formatCurrency } from '@/shared/utils/currency.utils'

const SETUP_ERROR_MESSAGE = 'No podemos procesar pagos en este momento. Intenta nuevamente.'

const route = useRoute()
const router = useRouter()

const {
  mutate: createIntent,
  data: intent,
  error: intentError,
  isPending: isCreatingIntent,
} = useCreatePaymentIntent()

const renderFailed = ref(false)

const orderIds = computed(() => {
  const raw = route.query.orders
  const value = typeof raw === 'string' ? raw : ''
  return value.split(',').filter((id) => id.length > 0)
})

const gateway = computed(() => (intent.value ? findPaymentGateway(intent.value.provider) : null))

const amount = computed(() =>
  gateway.value && intent.value ? gateway.value.describeIntent(intent.value) : null,
)

const failureKind = computed<'not-payable' | 'forbidden' | 'other' | null>(() => {
  if (renderFailed.value) return 'other'
  if (intent.value && !gateway.value) return 'other'

  const err = intentError.value
  if (!err) return null
  if (!isAxiosError(err) || !err.response) return 'other'

  const status = err.response.status
  if (status === 422) return 'not-payable'
  if (status === 403 || status === 404) return 'forbidden'
  return 'other'
})

const failureMessage = computed(() => {
  if (renderFailed.value || (intent.value && !gateway.value)) return SETUP_ERROR_MESSAGE

  const err = intentError.value
  if (isAxiosError(err) && err.response?.data?.error?.message) {
    return err.response.data.error.message
  }
  return SETUP_ERROR_MESSAGE
})

function requestIntent(ids: string[]) {
  renderFailed.value = false
  createIntent(ids)
}

function retry() {
  requestIntent(orderIds.value)
}

function handleSetupFailed(error: unknown) {
  console.error('[payments] no se pudo preparar el pago', error)
  renderFailed.value = true
}

function goToCart() {
  router.push(ROUTE_PATHS.PUBLIC_GALLERY)
}

function goToOrders() {
  router.push({ name: ROUTE_NAMES.ACCOUNT_ORDERS })
}

watch(
  orderIds,
  (ids) => {
    if (ids.length === 0) {
      router.replace(ROUTE_PATHS.PUBLIC_GALLERY)
      return
    }
    requestIntent(ids)
  },
  { immediate: true },
)
</script>

<template>
  <PublicLayout>
    <section v-if="orderIds.length > 0" class="payment-box-view">
      <header class="payment-box-view__header">
        <NButton quaternary size="small" data-test="back-to-cart" @click="goToCart">
          <template #icon><NIcon :component="ChevronBackOutline" /></template>
          Volver al carrito
        </NButton>

        <div class="payment-box-view__heading">
          <h1 class="payment-box-view__title">Pagar con tarjeta</h1>

          <p v-if="amount" class="payment-box-view__amount">
            {{ formatCurrency(amount.amountCents / 100, amount.currency) }}
          </p>
        </div>
      </header>

      <template v-if="failureKind">
        <NAlert type="error" :show-icon="true" class="payment-box-view__error">
          {{ failureMessage }}
        </NAlert>

        <template v-if="failureKind === 'not-payable'">
          <NButton type="primary" size="large" block data-test="go-to-orders" @click="goToOrders">
            Mis compras
          </NButton>

          <NButton size="large" block data-test="go-to-cart" @click="goToCart">
            Volver al carrito
          </NButton>
        </template>

        <NButton
          v-else-if="failureKind === 'forbidden'"
          type="primary"
          size="large"
          block
          data-test="go-to-cart"
          @click="goToCart"
        >
          Volver al carrito
        </NButton>

        <NButton
          v-else
          type="primary"
          size="large"
          block
          data-test="retry"
          :loading="isCreatingIntent"
          :disabled="isCreatingIntent"
          @click="retry"
        >
          Reintentar
        </NButton>
      </template>

      <component
        :is="gateway.checkoutComponent"
        v-else-if="gateway && intent"
        :intent="intent"
        @setup-failed="handleSetupFailed"
      />

      <NSpin v-else size="small" class="payment-box-view__loading" />
    </section>
  </PublicLayout>
</template>

<style scoped src="./payment-box-view.css" />
