<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NResult, NSpin } from 'naive-ui'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { useConfirmPayment } from '../../composables/mutations/use-confirm-payment'
import { usePaymentTransactionQuery } from '../../composables/queries/use-payment-transaction'
import { DEFAULT_PAYMENT_PROVIDER, findPaymentGateway } from '../../gateways/registry'
import { PAYMENT_METHOD, type PaymentMethod } from '../../types/payment-method'
import PaymentMethodModal from '../components/PaymentMethodModal/PaymentMethodModal.vue'

const route = useRoute()
const router = useRouter()
const { mutateAsync: confirmPayment } = useConfirmPayment()

const state = ref<'confirming' | 'approved' | 'declined' | 'error'>('confirming')
const message = ref<string | null>(null)
const clientTransactionId = ref<string | null>(null)
const showMethodModal = ref(false)
const transferChosen = ref(false)

const {
  data: transaction,
  isPending: isTransactionPending,
  error: transactionError,
} = usePaymentTransactionQuery(clientTransactionId)

function handleMethodChosen(method: PaymentMethod) {
  if (method !== PAYMENT_METHOD.TRANSFER) return
  transferChosen.value = true
}

onMounted(async () => {
  const provider = String(route.meta.provider ?? DEFAULT_PAYMENT_PROVIDER)
  const confirmation = findPaymentGateway(provider)?.parseReturn(route.query) ?? null

  if (!confirmation) {
    state.value = 'error'
    message.value = 'No pudimos identificar tu pago.'
    return
  }

  clientTransactionId.value = confirmation.clientTransactionId

  try {
    const result = await confirmPayment(confirmation)
    state.value = result.approved ? 'approved' : 'declined'
    message.value = result.message
  } catch {
    state.value = 'error'
    message.value = 'Tu pago se está procesando. Te contactaremos para confirmarlo.'
  }
})
</script>

<template>
  <PublicLayout>
    <div class="payment-return">
      <NSpin v-if="state === 'confirming'" size="large" />

      <NResult
        v-else-if="state === 'approved'"
        status="success"
        title="¡Pago confirmado!"
        description="Estamos preparando tus fotos."
      >
        <template #footer>
          <NButton type="primary" @click="router.push('/')">Volver al inicio</NButton>
        </template>
      </NResult>

      <NResult
        v-else-if="state === 'declined'"
        status="warning"
        title="El pago fue rechazado"
        :description="message ?? 'Intenta nuevamente con otra tarjeta.'"
      >
        <template v-if="transactionError" #footer>
          <p class="payment-return__notice">No pudimos cargar tu pago.</p>
          <NButton type="primary" @click="router.push('/gallery')">Volver a la galería</NButton>
        </template>
        <template v-else #footer>
          <NButton
            v-if="!transferChosen"
            type="primary"
            :loading="isTransactionPending"
            :disabled="isTransactionPending || !transaction"
            @click="showMethodModal = true"
          >
            Elegir otro método
          </NButton>
          <p v-else class="payment-return__notice">
            Te enviaremos los datos para la transferencia.
          </p>
        </template>
      </NResult>

      <NResult v-else status="info" title="Estamos procesando tu pago" :description="message ?? ''">
        <template #footer>
          <NButton @click="router.push('/gallery')">Volver a la galería</NButton>
        </template>
      </NResult>
    </div>

    <PaymentMethodModal
      v-if="transaction"
      v-model:show="showMethodModal"
      :order-ids="transaction.orderIds"
      :total="transaction.amountCents / 100"
      currency="USD"
      @method-chosen="handleMethodChosen"
    />
  </PublicLayout>
</template>

<style scoped src="./payment-return-view.css" />
