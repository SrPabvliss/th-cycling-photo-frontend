<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton } from 'naive-ui'
import { isAxiosError } from 'axios'

import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { checkoutPath, ROUTE_PATHS } from '@/core/navigation/route-paths'
import NotFoundView from '@/core/views/NotFoundView.vue'
import { useCreatePaymentIntent } from '@/features/payments/composables/mutations/use-create-payment-intent'
import { useDeclinedActions } from '@/features/payments/composables/use-declined-actions'
import { findPaymentGateway } from '@/features/payments/gateways/registry'
import { rememberCardPaymentEvent } from '@/features/payments/utils/card-payment-event'
import CheckoutProblemAlert from '@/shared/components/CheckoutProblemAlert/CheckoutProblemAlert.vue'
import { EmptyState } from '@/shared/components/empty-state'
import { BusyNote, ErrorState } from '@/shared/components/loading'
import { formatMoney } from '@/shared/pricing/tier-cards'

const CENTS_PER_UNIT = 100

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
const eventId = computed(() => {
  const raw = route.query.evento
  return typeof raw === 'string' && raw ? raw : null
})

const gateway = computed(() => (intent.value ? findPaymentGateway(intent.value.provider) : null))

const total = computed(() => {
  const amount = gateway.value && intent.value ? gateway.value.describeIntent(intent.value) : null
  return amount ? formatMoney(amount.amountCents / CENTS_PER_UNIT, amount.currency) : null
})

// What went wrong, if anything. 'missing': no orders, or not the buyer's. 'not-payable': the
// server will not charge these orders (paid already, cancelled). 'failed': nothing was charged
// and trying again may work.
const failure = computed<'missing' | 'not-payable' | 'is-transfer' | 'failed' | null>(() => {
  if (orderIds.value.length === 0) return 'missing'
  if (renderFailed.value || (intent.value && !gateway.value)) return 'failed'

  const error = intentError.value
  if (!error) return null
  const status = isAxiosError(error) ? (error.response?.status ?? 0) : 0
  if (status === 403 || status === 404) return 'missing'
  // Born to be paid by transfer: cards are not for it, and the order says how to pay it.
  if (status === 422 && messageKeyOf(error) === 'payment.order_is_transfer') return 'is-transfer'
  if (status === 422) return 'not-payable'
  return 'failed'
})

function messageKeyOf(error: unknown): string | undefined {
  return isAxiosError(error)
    ? (error.response?.data?.error?.messageKey as string | undefined)
    : undefined
}

const firstOrderPath = computed(() => `${ROUTE_PATHS.ACCOUNT}/orders/${orderIds.value[0] ?? ''}`)

// Already in the buyer's language: the api translates it.
const notPayableText = computed(() => {
  const error = intentError.value
  return isAxiosError(error)
    ? (error.response?.data?.error?.message as string | undefined)
    : undefined
})

function requestIntent() {
  renderFailed.value = false
  createIntent(orderIds.value)
}

function handleSetupFailed(error: unknown) {
  console.error('[payments] no se pudo preparar el pago', error)
  renderFailed.value = true
}

function goBack() {
  router.push(eventId.value ? checkoutPath(eventId.value) : ROUTE_PATHS.PUBLIC_GALLERY)
}

const transfer = useDeclinedActions(orderIds)

watch(
  orderIds,
  (ids) => {
    if (ids.length === 0) return
    // The gateway sends the buyer back without the event: kept for the way back to the order.
    if (eventId.value) rememberCardPaymentEvent(ids, eventId.value)
    requestIntent()
  },
  { immediate: true },
)
</script>

<template>
  <NotFoundView v-if="failure === 'missing'" />

  <!-- "card-payment", never "payment-box": Payphone's stylesheet paints that class white. -->
  <section v-else class="card-payment">
    <div class="card-payment__title-row">
      <button
        type="button"
        class="card-payment__back"
        aria-label="Volver al pedido"
        @click="goBack"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </button>
      <h1 class="card-payment__title">Pago con tarjeta</h1>
    </div>

    <div v-if="total && !failure" class="card-payment__total">
      <span class="card-payment__muted">Total</span>
      <span class="card-payment__amount">{{ total }}</span>
    </div>

    <EmptyState
      v-if="failure === 'is-transfer'"
      illustration="fueraDelCamino"
      title="Este pedido se paga por transferencia"
      text="En el detalle del pedido ves cómo pagarlo."
    >
      <template #actions>
        <NButton type="primary" size="large" block @click="router.push(firstOrderPath)">
          Ver el pedido
        </NButton>
      </template>
    </EmptyState>

    <EmptyState
      v-else-if="failure === 'not-payable'"
      illustration="fueraDelCamino"
      title="Este pedido ya no se puede pagar con tarjeta"
      :text="notPayableText"
    >
      <template #actions>
        <NButton
          type="primary"
          size="large"
          block
          @click="router.push({ name: ROUTE_NAMES.ACCOUNT_ORDERS })"
        >
          Ir a Mis fotos
        </NButton>
      </template>
    </EmptyState>

    <!-- One problem at a time: a failed switch to transfer takes the place of the first one, and
         the button below tries the transfer again. -->
    <template v-else-if="failure === 'failed'">
      <CheckoutProblemAlert
        v-if="transfer.problem.value"
        :problem="transfer.problem.value"
        :gallery-path="ROUTE_PATHS.PUBLIC_GALLERY"
      />
      <ErrorState
        v-else
        what="el formulario de pago"
        title="No pudimos abrir el pago"
        text="No se hizo ningún cargo."
        :retrying="isCreatingIntent"
        @retry="requestIntent"
      />
      <NButton
        size="large"
        block
        :loading="transfer.isSwitching.value"
        :disabled="transfer.isSwitching.value"
        :aria-busy="transfer.isSwitching.value ? 'true' : undefined"
        @click="transfer.payByTransfer()"
      >
        Pagar por transferencia
      </NButton>
    </template>

    <component
      :is="gateway.checkoutComponent"
      v-else-if="gateway && intent"
      :intent="intent"
      @setup-failed="handleSetupFailed"
    />

    <BusyNote v-else text="Abriendo la pasarela de pago" class="card-payment__busy" />
  </section>
</template>

<style scoped src="./payment-box-view.css" />
