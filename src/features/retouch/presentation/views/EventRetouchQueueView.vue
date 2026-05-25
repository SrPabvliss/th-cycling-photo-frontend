<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NGrid, NGridItem, NSpin } from 'naive-ui'

import { useInfiniteScrollTrigger } from '@/shared/composables/use-infinite-scroll-trigger'
import { useEventRetouchOrdersListSource } from '../../composables/queue-sources/use-event-retouch-orders-source'
import { RETOUCH_ROUTE_NAMES } from '../../constants/retouch-routes'
import { OPERATOR_PATH, OPERATOR_ROUTE_NAMES } from '@/features/operator/routes'
import RetouchOrderCard from '../components/RetouchOrderCard/RetouchOrderCard.vue'
import RetouchPageHeader from '../components/RetouchPageHeader/RetouchPageHeader.vue'
import RetouchEmptyState from '../components/RetouchEmptyState/RetouchEmptyState.vue'
import RetouchQueueFilterBar from '../components/RetouchQueueFilterBar/RetouchQueueFilterBar.vue'
import type { IRetouchQueueOrder } from '../../types/responses/operator-retouch-queue.response'
import type { TRetouchOrderScope } from '../../types/responses/operator-retouch-orders.response'

const route = useRoute()
const router = useRouter()

const eventSlug = computed(() => route.params.eventSlug as string)
const scope = ref<TRetouchOrderScope>('pending')

const source = useEventRetouchOrdersListSource(eventSlug, scope)

const eventTitle = computed(() => source.orders.value[0]?.eventName ?? 'Cola de retoque')

const totalPendingPhotos = computed(() =>
  source.orders.value.reduce((acc, o) => acc + (o.totalItems - o.retouchedItems), 0),
)

const isPendingScope = computed(() => scope.value === 'pending')
const isCompletedScope = computed(() => scope.value === 'completed')

const goWorkspace = (orderId?: string) =>
  router.push({
    name: RETOUCH_ROUTE_NAMES.EVENT_WORKSPACE,
    params: { eventSlug: eventSlug.value },
    query: orderId ? { orderId } : undefined,
  })

const goDashboard = () => router.push({ name: OPERATOR_ROUTE_NAMES.DASHBOARD })

const handleCardClick = (order: IRetouchQueueOrder) => goWorkspace(order.orderId)

const handleScopeChange = (value: TRetouchOrderScope) => {
  scope.value = value
}

const headerSubtitle = computed(() =>
  isCompletedScope.value
    ? 'Órdenes ya retocadas en su totalidad'
    : 'Órdenes pendientes de retoque en este evento',
)

const emptyMessage = computed(() =>
  isCompletedScope.value
    ? 'Aún no hay órdenes completadas en este evento'
    : 'No hay órdenes pendientes de retoque',
)

const sentinel = useInfiniteScrollTrigger(() => source.fetchNextPage(), {
  isBusy: computed(() => source.isFetchingNextPage.value),
  canLoadMore: computed(() => source.hasNextPage.value),
})
</script>

<template>
  <div class="page-view">
    <div class="page-view__content event-retouch-queue">
      <RetouchPageHeader
        :title="eventTitle"
        :subtitle="headerSubtitle"
        :total-orders="source.total.value"
        :total-pending-photos="isPendingScope ? totalPendingPhotos : undefined"
        :back-to="OPERATOR_PATH"
        :hide-start-cta="isCompletedScope"
        :start-disabled="source.orders.value.length === 0"
        @start="goWorkspace()"
      />

      <RetouchQueueFilterBar
        :scope="scope"
        @update:scope="handleScopeChange"
        @update:selected-event-slug="() => undefined"
      />

      <NSpin :show="source.isPending.value">
        <RetouchEmptyState
          v-if="!source.isPending.value && source.orders.value.length === 0"
          :title="emptyMessage"
          @go-dashboard="goDashboard"
        />
        <template v-else>
          <NGrid :cols="4" :x-gap="12" :y-gap="12" responsive="screen">
            <NGridItem v-for="(order, index) in source.orders.value" :key="order.orderId">
              <RetouchOrderCard
                :order-id="order.orderId"
                :buyer-name="order.buyerName"
                :show-event-badge="false"
                :created-at="order.createdAt"
                :pending-photos-count="order.totalItems - order.retouchedItems"
                :total-photos-count="order.totalItems"
                :retouched-photos-count="order.retouchedItems"
                :thumbs="
                  order.items.map((it) => ({ thumbnailUrl: it.thumbnailUrl, alt: it.publicSlug }))
                "
                :is-first="isPendingScope && index === 0"
                @click="handleCardClick(order)"
              />
            </NGridItem>
          </NGrid>
          <div ref="sentinel" class="queue-sentinel" aria-hidden="true" />
          <div v-if="source.isFetchingNextPage.value" class="queue-loading-more">
            <NSpin :size="20" /> <span>Cargando más órdenes...</span>
          </div>
          <div
            v-else-if="!source.hasNextPage.value && source.orders.value.length > 0"
            class="queue-end-marker"
          >
            <span>—— sin más órdenes ——</span>
          </div>
        </template>
      </NSpin>
    </div>
  </div>
</template>

<style scoped src="./styles/event-retouch-queue-view.css" />
