<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NResult, NSpin } from 'naive-ui'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { DELIVERY_ROUTE_NAMES } from '@/features/delivery/routes'
import { useConfirmPayment } from '../../composables/mutations/use-confirm-payment'
import { usePaymentTransactionQuery } from '../../composables/queries/use-payment-transaction'
import { DEFAULT_PAYMENT_PROVIDER, findPaymentGateway } from '../../gateways/registry'
import { PAYMENT_METHOD, type PaymentMethod } from '../../types/payment-method'
import type { IPaymentDelivery } from '../../types/responses/payment-intent.response'
import PaymentMethodModal from '../components/PaymentMethodModal/PaymentMethodModal.vue'

const route = useRoute()
const router = useRouter()
const { mutateAsync: confirmPayment } = useConfirmPayment()

const state = ref<'confirming' | 'approved' | 'declined' | 'error'>('confirming')
const message = ref<string | null>(null)
const clientTransactionId = ref<string | null>(null)
const showMethodModal = ref(false)
const transferChosen = ref(false)
const confirmedDeliveries = ref<IPaymentDelivery[]>([])

const deliveries = computed<IPaymentDelivery[]>(() =>
  confirmedDeliveries.value.length > 0
    ? confirmedDeliveries.value
    : (transaction.value?.deliveries ?? []),
)

const {
  data: transaction,
  isPending: isTransactionPending,
  error: transactionError,
} = usePaymentTransactionQuery(clientTransactionId)

const isLeavingForDelivery = computed(
  () =>
    state.value === 'approved' &&
    (deliveries.value.length === 1 ||
      (confirmedDeliveries.value.length === 0 && isTransactionPending.value)),
)

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
    confirmedDeliveries.value = result.deliveries ?? []
  } catch {
    state.value = 'error'
    message.value = 'Tu pago se está procesando. Te contactaremos para confirmarlo.'
  }
})

watch(
  [state, deliveries],
  ([currentState, currentDeliveries]) => {
    if (currentState !== 'approved' || currentDeliveries.length !== 1) return
    router.replace({
      name: DELIVERY_ROUTE_NAMES.DELIVERY,
      params: { token: currentDeliveries[0]!.token },
    })
  },
  { immediate: true },
)
</script>

<template>
  <PublicLayout>
    <div class="payment-return">
      <NSpin v-if="state === 'confirming' || isLeavingForDelivery" size="large" />

      <NResult
        v-else-if="state === 'approved'"
        status="success"
        title="¡Pago confirmado!"
        :description="
          deliveries.length > 0
            ? 'Tus fotos están listas para descargar.'
            : 'Te contactaremos con tu enlace de descarga.'
        "
      >
        <template #footer>
          <div v-if="deliveries.length > 0" class="payment-return__deliveries">
            <NButton
              v-for="delivery in deliveries"
              :key="delivery.orderId"
              type="primary"
              @click="
                router.push({
                  name: DELIVERY_ROUTE_NAMES.DELIVERY,
                  params: { token: delivery.token },
                })
              "
            >
              Descargar fotos de {{ delivery.eventName }}
            </NButton>
          </div>
          <NButton v-else type="primary" @click="router.push('/')">Volver al inicio</NButton>
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
