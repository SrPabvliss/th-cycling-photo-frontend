<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import { NAlert, NButton, NSpin } from 'naive-ui'

import { useCreatePaymentIntent } from '@/features/payments/composables/mutations/use-create-payment-intent'
import { useConfirmPayment } from '@/features/payments/composables/mutations/use-confirm-payment'
import { findPaymentGateway } from '@/features/payments/gateways/registry'
import type {
  IPaymentGateway,
  IPaymentGatewayCheckoutInstance,
} from '@/features/payments/gateways/types'
import type { IConfirmPaymentRequest } from '@/features/payments/types/requests/payment.request'
import type { IPaymentIntent } from '@/features/payments/types/responses/payment-intent.response'

const SETUP_ERROR_MESSAGE = 'No podemos procesar pagos en este momento. Intenta nuevamente.'

const props = defineProps<{ orderId: string }>()
const emit = defineEmits<{ paid: [orderId: string]; declined: [message: string | null] }>()

const { mutateAsync: createIntent } = useCreatePaymentIntent()
const { mutateAsync: confirmPayment } = useConfirmPayment()

const gateway = shallowRef<IPaymentGateway | null>(null)
const intent = shallowRef<IPaymentIntent | null>(null)
const gatewayInstance = ref<IPaymentGatewayCheckoutInstance | null>(null)

const setupError = ref<string | null>(null)
const paymentError = ref<string | null>(null)
const isSettling = ref(false)
const canRetry = ref(false)
const isPaid = ref(false)
const isRetrying = ref(false)

async function preparePayment() {
  setupError.value = null
  canRetry.value = false
  gateway.value = null
  intent.value = null

  try {
    const created = await createIntent(props.orderId)
    const selected = findPaymentGateway(created.provider)
    if (!selected) throw new Error(`Unsupported payment provider: ${created.provider}`)

    gateway.value = selected
    intent.value = created
  } catch (error) {
    reportSetupFailure(error)
  }
}

function reportSetupFailure(error: unknown) {
  console.error('[payments] no se pudo preparar el pago', error)
  setupError.value = SETUP_ERROR_MESSAGE
  canRetry.value = true
}

async function retry() {
  if (isRetrying.value) return

  isRetrying.value = true
  paymentError.value = null
  try {
    await preparePayment()
  } finally {
    isRetrying.value = false
  }
}

onMounted(preparePayment)

function requireFreshIntent() {
  gateway.value = null
  intent.value = null
  canRetry.value = true
}

async function handlePay() {
  const box = gatewayInstance.value
  if (!box) return
  if (box.isProcessing || isSettling.value || canRetry.value || isPaid.value) return

  paymentError.value = null

  let confirmation: IConfirmPaymentRequest
  try {
    confirmation = await box.pay()
  } catch (error) {
    if (error instanceof Error && error.message === 'Form Validation Error') {
      paymentError.value = 'Revisa los datos de la tarjeta.'
      return
    }

    paymentError.value = 'No se pudo procesar el pago. Intenta nuevamente.'
    requireFreshIntent()
    return
  }

  isSettling.value = true
  try {
    const result = await confirmPayment(confirmation)

    if (result.approved) {
      isPaid.value = true
      emit('paid', result.orderId)
    } else {
      paymentError.value = result.message ?? 'El pago fue rechazado.'
      requireFreshIntent()
      emit('declined', result.message)
    }
  } catch {
    paymentError.value =
      'Tu pago se está procesando. No cierres esta página; si el problema persiste, contáctanos.'
    requireFreshIntent()
  } finally {
    isSettling.value = false
  }
}
</script>

<template>
  <section class="payment-checkout">
    <template v-if="setupError">
      <NAlert type="error" :show-icon="true">{{ setupError }}</NAlert>

      <NButton
        type="primary"
        size="large"
        block
        :loading="isRetrying"
        :disabled="isRetrying"
        @click="retry"
      >
        Reintentar
      </NButton>
    </template>

    <template v-else>
      <component
        :is="gateway.checkoutComponent"
        v-if="gateway && intent && !isPaid"
        ref="gatewayInstance"
        :intent="intent"
        :settling="isSettling"
        @pay-requested="handlePay"
        @setup-failed="reportSetupFailure"
      />

      <NAlert v-if="paymentError" type="warning" :show-icon="true" class="payment-checkout__error">
        {{ paymentError }}
      </NAlert>

      <p v-if="isPaid" class="payment-checkout__notice">Tu pago fue confirmado.</p>

      <NButton
        v-else-if="canRetry"
        type="primary"
        size="large"
        block
        :loading="isRetrying"
        :disabled="isRetrying"
        @click="retry"
      >
        Reintentar
      </NButton>

      <NSpin v-else-if="!intent" size="small" class="payment-checkout__loading" />

      <p v-if="isSettling" class="payment-checkout__notice">
        Estamos confirmando tu pago. No cierres esta ventana.
      </p>
    </template>
  </section>
</template>

<style scoped src="./payment-checkout.css" />
