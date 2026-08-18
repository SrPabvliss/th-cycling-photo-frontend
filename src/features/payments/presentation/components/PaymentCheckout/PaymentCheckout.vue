<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import { NAlert, NButton, NSpin } from 'naive-ui'

import { useCreatePaymentIntent } from '@/features/payments/composables/mutations/use-create-payment-intent'
import { findPaymentGateway } from '@/features/payments/gateways/registry'
import type { IPaymentGateway } from '@/features/payments/gateways/types'
import type { IPaymentIntent } from '@/features/payments/types/responses/payment-intent.response'

const SETUP_ERROR_MESSAGE = 'No podemos procesar pagos en este momento. Intenta nuevamente.'

const props = defineProps<{ orderIds: string[] }>()
const emit = defineEmits<{ 'setup-failed': [error: unknown] }>()

const { mutateAsync: createIntent } = useCreatePaymentIntent()

const gateway = shallowRef<IPaymentGateway | null>(null)
const intent = shallowRef<IPaymentIntent | null>(null)

const setupError = ref<string | null>(null)
const canRetry = ref(false)
const isRetrying = ref(false)

async function preparePayment() {
  setupError.value = null
  canRetry.value = false
  gateway.value = null
  intent.value = null

  try {
    const created = await createIntent(props.orderIds)
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
  const response = (error as { response?: { data?: { error?: { message?: string } } } }).response
  setupError.value = response?.data?.error?.message ?? SETUP_ERROR_MESSAGE
  canRetry.value = true
  emit('setup-failed', error)
}

async function retry() {
  if (isRetrying.value) return

  isRetrying.value = true
  try {
    await preparePayment()
  } finally {
    isRetrying.value = false
  }
}

onMounted(preparePayment)
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
        v-if="gateway && intent"
        :intent="intent"
        @setup-failed="reportSetupFailure"
      />

      <NSpin v-else-if="!intent" size="small" class="payment-checkout__loading" />
    </template>
  </section>
</template>

<style scoped src="./payment-checkout.css" />
