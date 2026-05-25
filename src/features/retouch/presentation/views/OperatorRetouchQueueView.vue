<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NGrid, NGridItem, NSpin } from 'naive-ui'

import { useInfiniteScrollTrigger } from '@/shared/composables/use-infinite-scroll-trigger'
import { useOperatorRetouchOrdersListSource } from '../../composables/queue-sources/use-retouch-orders-list-source'
import { useOperatorActiveEventsQuery } from '@/features/operator/composables/queries/use-operator-active-events'
import { useOperatorCompletedEventsQuery } from '@/features/operator/composables/queries/use-operator-completed-events'
import { RETOUCH_ROUTE_NAMES } from '../../constants/retouch-routes'
import { OPERATOR_PATH, OPERATOR_ROUTE_NAMES } from '@/features/operator/routes'
import RetouchOrderCard from '../components/RetouchOrderCard/RetouchOrderCard.vue'
import RetouchPageHeader from '../components/RetouchPageHeader/RetouchPageHeader.vue'
import RetouchEmptyState from '../components/RetouchEmptyState/RetouchEmptyState.vue'
import RetouchQueueFilterBar from '../components/RetouchQueueFilterBar/RetouchQueueFilterBar.vue'
import type {
  IOperatorRetouchOrder,
  TRetouchOrderScope,
} from '../../types/responses/operator-retouch-orders.response'

const router = useRouter()

const scope = ref<TRetouchOrderScope>('pending')
const selectedEventSlug = ref<string | null>(null)

const source = useOperatorRetouchOrdersListSource(scope, selectedEventSlug)

const eventsPage = ref(1)
const activeEventsQuery = useOperatorActiveEventsQuery(eventsPage)
const completedEventsQuery = useOperatorCompletedEventsQuery(eventsPage)

const eventOptions = computed(() => {
  const active = (activeEventsQuery.data.value?.items ?? []).map((e) => ({
    label: e.event.name,
    value: e.event.slug,
  }))
  const completed = (completedEventsQuery.data.value?.items ?? []).map((e) => ({
    label: e.event.name,
    value: e.event.slug,
  }))
  const seen = new Set<string>()
  return [...active, ...completed].filter((opt) => {
    if (seen.has(opt.value)) return false
    seen.add(opt.value)
    return true
  })
})

const goWorkspace = (orderId?: string) =>
  router.push({
    name: RETOUCH_ROUTE_NAMES.OPERATOR_WORKSPACE,
    query: orderId ? { orderId } : undefined,
  })

const goDashboard = () => router.push({ name: OPERATOR_ROUTE_NAMES.DASHBOARD })

const totalPendingPhotos = computed(() =>
  source.orders.value.reduce((acc, o) => acc + o.pendingPhotosCount, 0),
)

const handleCardClick = (order: IOperatorRetouchOrder) => goWorkspace(order.orderId)

const handleScopeChange = (value: TRetouchOrderScope) => {
  scope.value = value
}

const handleEventChange = (value: string | null) => {
  selectedEventSlug.value = value
}

const isPendingScope = computed(() => scope.value === 'pending')
const isCompletedScope = computed(() => scope.value === 'completed')

const headerTitle = computed(() =>
  isCompletedScope.value ? 'Retoque · completadas' : 'Cola de retoque',
)

const headerSubtitle = computed(() =>
  isCompletedScope.value
    ? 'Órdenes ya retocadas en su totalidad'
    : 'Órdenes pendientes ordenadas por antigüedad',
)

const emptyMessage = computed(() =>
  isCompletedScope.value
    ? 'Aún no hay órdenes completadas en este criterio'
    : 'No hay órdenes pendientes de retoque',
)

const sentinel = useInfiniteScrollTrigger(() => source.fetchNextPage(), {
  isBusy: computed(() => source.isFetchingNextPage.value),
  canLoadMore: computed(() => source.hasNextPage.value),
})
</script>

<template>
  <div class="page-view">
    <div class="page-view__content retouch-queue">
      <RetouchPageHeader
        :title="headerTitle"
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
        :selected-event-slug="selectedEventSlug"
        :event-options="eventOptions"
        @update:scope="handleScopeChange"
        @update:selected-event-slug="handleEventChange"
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
                :event-name="order.eventName"
                show-event-badge
                :created-at="order.createdAt"
                :pending-photos-count="order.pendingPhotosCount"
                :total-photos-count="order.totalPhotosCount"
                :retouched-photos-count="order.retouchedPhotosCount"
                :thumbs="
                  order.previewPhotos.map((p) => ({
                    thumbnailUrl: p.thumbnailUrl,
                    alt: p.filename,
                  }))
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

<style scoped src="./styles/operator-retouch-queue-view.css" />
