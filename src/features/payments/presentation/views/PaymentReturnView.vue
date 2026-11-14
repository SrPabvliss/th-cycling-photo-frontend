<script setup lang="ts">
import { computed } from 'vue'
import { NButton } from 'naive-ui'

import { checkoutPath, ROUTE_PATHS } from '@/core/navigation/route-paths'
import { EmptyState } from '@/shared/components/empty-state'
import { BusyNote, ErrorState } from '@/shared/components/loading'
import CheckoutProblemAlert from '@/shared/components/CheckoutProblemAlert/CheckoutProblemAlert.vue'
import { useDeclinedActions } from '../../composables/use-declined-actions'
import { usePaymentReturn } from '../../composables/use-payment-return'
import { cardPaymentEvent } from '../../utils/card-payment-event'

const { outcome, orderIds, isAsking, retry } = usePaymentReturn()
const transfer = useDeclinedActions(orderIds)

// Declined: the same orders can take another card (a new intent) or a transfer.
const eventId = computed(() => cardPaymentEvent(orderIds.value))
const anotherCard = computed(() => ({
  path: ROUTE_PATHS.PAYMENT_BOX,
  query: {
    orders: orderIds.value.join(','),
    ...(eventId.value ? { evento: eventId.value } : {}),
  },
}))
const backToOrder = computed(() =>
  eventId.value ? checkoutPath(eventId.value) : ROUTE_PATHS.PUBLIC_GALLERY,
)

const orderPath = computed(() =>
  orderIds.value[0]
    ? `${ROUTE_PATHS.ACCOUNT}/orders/${orderIds.value[0]}`
    : `${ROUTE_PATHS.ACCOUNT}/orders`,
)
</script>

<template>
  <div class="payment-return">
    <!-- Confirmed leaves for its own screen; until then it reads like the wait. -->
    <!-- The spinner's own live region says it; the heading is the same words, seen. -->
    <div
      v-if="outcome === 'confirming' || outcome === 'confirmed'"
      class="payment-return__wait"
      aria-busy="true"
    >
      <BusyNote text="Confirmando tu pago" class="payment-return__spinner" />
      <h1 class="payment-return__title">Confirmando tu pago</h1>
      <p class="payment-return__text">No cierres esta página. Tarda unos segundos.</p>
    </div>

    <!-- After two minutes it stops asking: the spinner goes, the words and the way out stay. -->
    <div
      v-else-if="outcome === 'late'"
      class="payment-return__wait"
      :aria-busy="isAsking ? 'true' : undefined"
    >
      <BusyNote
        v-if="isAsking"
        text="Seguimos confirmando tu pago"
        class="payment-return__spinner"
      />
      <h1 class="payment-return__title">Seguimos confirmando tu pago</h1>
      <p class="payment-return__text">
        Está tardando más de lo normal. No se cobra dos veces. Puedes salir de esta página: el
        pedido queda en Mis fotos y te avisamos por correo.
      </p>
      <RouterLink v-slot="{ href, navigate }" :to="orderPath" custom>
        <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
          Ver mi pedido
        </NButton>
      </RouterLink>
    </div>

    <EmptyState
      v-else-if="outcome === 'declined'"
      illustration="pagoRechazado"
      title="No se pudo cobrar tu tarjeta"
      text="No se hizo ningún cargo. Tus fotos siguen en el carrito."
      :heading-level="1"
    >
      <template #actions>
        <RouterLink v-slot="{ href, navigate }" :to="anotherCard" custom>
          <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
            Intentar con otra tarjeta
          </NButton>
        </RouterLink>
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
        <CheckoutProblemAlert
          v-if="transfer.problem.value"
          :problem="transfer.problem.value"
          :gallery-path="backToOrder"
        />
        <RouterLink class="payment-return__link" :to="backToOrder">Volver al pedido</RouterLink>
      </template>
    </EmptyState>

    <ErrorState
      v-else
      what="la confirmación de tu pago"
      stacked
      title="No pudimos confirmar tu pago"
      text="Puede ser tu conexión. No se cobra dos veces."
      @retry="retry"
    />
  </div>
</template>

<style scoped src="./payment-return-view.css" />
