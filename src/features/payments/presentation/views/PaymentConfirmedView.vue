<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton } from 'naive-ui'
import { isAxiosError } from 'axios'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import NotFoundView from '@/core/views/NotFoundView.vue'
import AdSlot from '@/features/ads/presentation/components/AdSlot/AdSlot.vue'
import { useMyOrderDetailQuery } from '@/features/account/composables/queries/use-my-order-detail'
import { EmptyState } from '@/shared/components/empty-state'
import { ErrorState, TtSkeleton, useDelayedFlag } from '@/shared/components/loading'

const route = useRoute()
const router = useRouter()
const orderId = computed(() => (route.params.orderId as string | undefined) ?? '')
const orderPath = computed(() => `${ROUTE_PATHS.ACCOUNT}/orders/${orderId.value}`)

// Read from the server: this screen survives a reload, and only says "paid" when it is.
const {
  status,
  data: order,
  error,
  isFetching,
  refetch,
} = useMyOrderDetailQuery(orderId, { silent: true })

const isPending = computed(() => status.value === 'pending')
const showSkeleton = useDelayedFlag(isPending)
const isMissing = computed(
  () => isAxiosError(error.value) && [403, 404].includes(error.value.response?.status ?? 0),
)
const isReady = computed(() => order.value?.state === 'ready')

// Not settled (still confirming, or anything else): the order detail tells where it stands.
watch(
  order,
  (current) => {
    if (current && current.state !== 'ready') void router.replace(orderPath.value)
  },
  { immediate: true },
)

const text = computed(() => {
  const count = order.value?.photos.length ?? 0
  const ready = count === 1 ? 'Tu foto está lista' : `Tus ${count} fotos están listas`
  return `${ready} para descargar en alta calidad. También te enviamos el enlace a tu correo.`
})
</script>

<template>
  <div class="payment-confirmed" :aria-busy="isPending ? 'true' : undefined">
    <TtSkeleton
      v-if="showSkeleton"
      height="calc(var(--tt-control-m) * 5)"
      radius="l"
      class="payment-confirmed__skeleton"
    />

    <template v-else-if="isPending" />

    <NotFoundView v-else-if="isMissing" />

    <ErrorState
      v-else-if="!order"
      title="No pudimos cargar tu pedido"
      text="Puede ser tu conexión. Tu pago está registrado."
      :retrying="isFetching"
      @retry="refetch()"
    />

    <template v-else-if="isReady">
      <EmptyState
        illustration="fotosListas"
        title="Pago confirmado"
        :text="text"
        :heading-level="1"
      >
        <template #actions>
          <RouterLink v-slot="{ href, navigate }" :to="orderPath" custom>
            <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
              Ver y descargar mis fotos
            </NButton>
          </RouterLink>
          <RouterLink class="payment-confirmed__link" :to="ROUTE_PATHS.PUBLIC_GALLERY">
            Seguir explorando
          </RouterLink>
        </template>
      </EmptyState>
      <AdSlot class="payment-confirmed__ad" format="A" :seed="19" />
    </template>
  </div>
</template>

<style scoped>
.payment-confirmed__ad {
  margin-block-start: var(--tt-space-5);
}

.payment-confirmed {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  inline-size: 100%;
  max-inline-size: calc(var(--tt-space-8) * 7);
  margin-inline: auto;
  padding: var(--tt-space-6) var(--tt-space-4);
  font-family: var(--tt-font-sans);
}

.payment-confirmed__link {
  display: flex;
  align-items: center;
  justify-content: center;
  min-block-size: var(--tt-control-m);
  color: var(--tt-primary-ink);
  text-decoration: none;
  font-size: var(--tt-type-body-s-medium-size);
  font-weight: var(--tt-type-title-weight);
}
</style>
