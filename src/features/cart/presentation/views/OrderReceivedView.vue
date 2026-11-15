<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NButton } from 'naive-ui'
import { isAxiosError } from 'axios'

import { problemKind } from '@/core/http/problem-kind'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import NotFoundView from '@/core/views/NotFoundView.vue'
import { useMyOrderDetailQuery } from '@/features/account/composables/queries/use-my-order-detail'
import { useMyPhonesQuery } from '@/features/account/composables/queries/use-my-phones'
import { EmptyState } from '@/shared/components/empty-state'
import { ErrorState, TtSkeleton, useLoadPhase } from '@/shared/components/loading'
import { formatMoney } from '@/shared/pricing/tier-cards'
import { maskPhone } from '@/shared/utils/mask-phone'
import { orderCode } from '@/features/account/utils/order-code'

const STEPS = [
  { title: 'Te escribimos por WhatsApp', text: 'Con el total y los datos de la cuenta.' },
  {
    title: 'Transfieres y respondes ahí mismo',
    text: 'Envía el comprobante en ese chat, así queda atado a tu pedido.',
  },
  { title: 'Liberamos tus fotos', text: 'Aparecen en Mis fotos, sin marca de agua.' },
]

const route = useRoute()
const orderId = computed(() => (route.params.orderId as string | undefined) ?? '')

// Read from the server, so the screen survives a reload and shows what the server charged.
const {
  status,
  data: order,
  error,
  isFetching,
  refetch,
} = useMyOrderDetailQuery(orderId, { silent: true })
const { data: phones } = useMyPhonesQuery({ silent: true })

// Without network a load that did not finish waits for it: the error state says so.
const { isPending, showSkeleton } = useLoadPhase(status)
const isMissing = computed(
  () => isAxiosError(error.value) && [403, 404].includes(error.value.response?.status ?? 0),
)

const code = computed(() => (order.value ? orderCode(order.value.id) : ''))
const count = computed(() => order.value?.photos.length ?? 0)
const amount = computed(() =>
  order.value?.subtotal != null && order.value.currency
    ? formatMoney(Number(order.value.subtotal), order.value.currency)
    : null,
)
const phone = computed(() => {
  const main = phones.value?.find((each) => each.isPrimary)
  return main ? maskPhone(main.phoneNumber) : ''
})
</script>

<template>
  <div class="order-received" :aria-busy="isPending ? 'true' : undefined">
    <div v-if="showSkeleton" class="order-received__skeleton">
      <TtSkeleton width="40%" height="var(--tt-space-6)" radius="text" />
      <TtSkeleton height="calc(var(--tt-control-m) * 2)" radius="l" />
      <TtSkeleton height="calc(var(--tt-control-m) * 3)" radius="m" />
    </div>

    <template v-else-if="isPending" />

    <NotFoundView v-else-if="isMissing" />

    <ErrorState
      v-else-if="!order"
      what="tu pedido"
      :kind="problemKind(error)"
      stacked
      text="Tu pedido está guardado."
      :retrying="isFetching"
      @retry="refetch()"
    />

    <template v-else>
      <div class="order-received__head">
        <EmptyState illustration="transferencia" title="Pedido recibido" :heading-level="1" />
        <!-- Outside EmptyState: the number is set in bold within the sentence. -->
        <p class="order-received__lead">
          Te escribimos por WhatsApp<template v-if="phone">
            al <strong class="order-received__phone">{{ phone }}</strong></template
          >
          con el total y los datos para pagar.
        </p>
      </div>

      <div class="order-received__card">
        <div class="order-received__row">
          <span class="order-received__muted">Pedido</span>
          <strong>{{ code }}</strong>
        </div>
        <div class="order-received__row">
          <span class="order-received__muted"
            >{{ count }} {{ count === 1 ? 'foto' : 'fotos' }}</span
          >
          <strong v-if="amount" class="order-received__amount">{{ amount }}</strong>
        </div>
      </div>

      <ol class="order-received__steps">
        <li v-for="step in STEPS" :key="step.title">
          <strong>{{ step.title }}</strong>
          <span>{{ step.text }}</span>
        </li>
      </ol>

      <div class="order-received__actions">
        <RouterLink
          v-slot="{ href, navigate }"
          :to="`${ROUTE_PATHS.ACCOUNT}/orders/${order.id}`"
          custom
        >
          <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
            Ver mi pedido
          </NButton>
        </RouterLink>
        <RouterLink class="order-received__link" :to="ROUTE_PATHS.PUBLIC_GALLERY">
          Seguir explorando
        </RouterLink>
      </div>
    </template>
  </div>
</template>

<style scoped src="./order-received-view.css" />
