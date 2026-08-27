<script setup lang="ts">
import { computed, provide, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { LocationQueryRaw } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { NButton, NResult, NSpin } from 'naive-ui'

import PageHeader from '@/shared/components/PageHeader.vue'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { useTenantProfile } from '@/features/tenant-profile/composables/queries/use-tenant-profile'
import { useInfiniteScrollTrigger } from '@/shared/composables/use-infinite-scroll-trigger'
import { useOrdersListQuery } from '../../composables/queries/use-orders-list'
import { useOrdersStatsQuery } from '../../composables/queries/use-orders-stats'
import { useGroupedOrders, type IOrderGroupCardRow } from '../../composables/use-grouped-orders'
import { useOrderActions } from '../../composables/use-order-actions'
import {
  ORDER_FILTER_STATE_KEY,
  orderFiltersToQuery,
  seedOrderFiltersFromQuery,
  useOrderFilters,
} from '../../composables/use-order-filters'
import type { IOrderFilters } from '../../types/requests/order-filters.request'
import type { IOrderListItem } from '../../types/responses/order-list.response'
import type { IOrderCustomerGroup } from '../../types/order-customer-group.type'
import type { OrderOperatorRole } from '../../utils/order-actions'
import OrderStatsCards from '../components/OrderStatsCards/OrderStatsCards.vue'
import OrderStatusTabs from '../components/OrderStatusTabs/OrderStatusTabs.vue'
import OrderFilters from '../components/OrderFilters/OrderFilters.vue'
import OrderGroup from '../components/OrderGroup/OrderGroup.vue'
import OrderDetailDrawer from '../components/OrderDetailPanel/OrderDetailDrawer.vue'
import OrderDetailSheet from '../components/OrderDetailPanel/OrderDetailSheet.vue'
import ReceivablesNote from '../components/OrderEmptyStates/ReceivablesNote.vue'
import FirstRun from '../components/OrderEmptyStates/FirstRun.vue'
import NoResults from '../components/OrderEmptyStates/NoResults.vue'
import OperatorEmpty from '../components/OrderEmptyStates/OperatorEmpty.vue'

const ORDERS_PER_PAGE = 15

const SUBTITLES: Record<OrderOperatorRole, string> = {
  titan: 'Todos los pedidos de la plataforma, de todos los organizadores',
  organizer: 'Los pedidos de los eventos de {organizador}',
  operator: 'Los pedidos de los eventos en los que te asignaron',
}

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'

const router = useRouter()
const route = useRoute()
const authStore = useSessionStore()
const { has } = usePermissions()

const role = computed<OrderOperatorRole>(() => {
  if (has(PERMISSIONS.EVENT_READ_ALL)) return 'titan'
  return authStore.currentUser?.tenantId ? 'organizer' : 'operator'
})

const filterState = useOrderFilters()
provide(ORDER_FILTER_STATE_KEY, filterState)
const { filters, clearAll, tab } = filterState

seedOrderFiltersFromQuery(filterState, route.query)

const openOrderId = computed<string | null>(() => {
  const raw = route.query.order
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && value ? value : null
})

function buildQuery(value: IOrderFilters, orderId: string | null): LocationQueryRaw {
  const base = orderFiltersToQuery(value)
  return orderId ? { ...base, order: orderId } : base
}

watch(
  filters,
  (value) => {
    router.replace({ query: buildQuery(value, openOrderId.value) })
  },
  { deep: true },
)

const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useOrdersListQuery(filters, ORDERS_PER_PAGE)
const statsEventId = computed(() => filters.value.eventId)
const statsSearch = computed(() => filters.value.search)
const { data: stats } = useOrdersStatsQuery(statsEventId, statsSearch)

const { data: tenantProfile } = useTenantProfile(computed(() => role.value === 'organizer'))

const subtitle = computed(() => {
  if (role.value !== 'organizer') return SUBTITLES[role.value]
  const name = tenantProfile.value?.publicName || tenantProfile.value?.name || 'tu organización'
  return SUBTITLES.organizer.replace('{organizador}', name)
})

const { handleConfirmPayment, handleNotifyPaymentInfo, handleSendDelivery } = useOrderActions()

const orders = computed<IOrderListItem[]>(() => data.value?.pages.flatMap((p) => p.items) ?? [])

const rows = useGroupedOrders(orders)

const customerGroups = computed<IOrderCustomerGroup[]>(() =>
  rows.value.reduce<IOrderCustomerGroup[]>((groups, row) => {
    if (row.type === 'separator') {
      return [
        ...groups,
        {
          key: row.key,
          name: row.customerLabel,
          phone: row.customerPhone,
          isUnassigned: row.customerPhone === null && row.customerLabel === 'Sin cliente',
          orders: [],
        },
      ]
    }
    const currentGroup = groups[groups.length - 1]
    currentGroup?.orders.push((row as IOrderGroupCardRow).order)
    return groups
  }, []),
)

const hasActiveFilters = computed(
  () =>
    filters.value.search !== null ||
    filters.value.eventId !== null ||
    filters.value.tab !== 'all',
)

const totalOrders = computed(
  () => data.value?.pages[data.value.pages.length - 1]?.pagination.total ?? orders.value.length,
)
const orderCountLabel = computed(() => (totalOrders.value === 1 ? 'pedido' : 'pedidos'))
const customerCountLabel = computed(() =>
  customerGroups.value.length === 1 ? 'cliente' : 'clientes',
)

const showCobrarNote = computed(
  () => filters.value.tab === 'pending' && (stats.value?.openCount ?? 0) > 0,
)

const isMobile = useMediaQuery('(max-width: 767px)')

const sentinelRef = useInfiniteScrollTrigger(() => fetchNextPage(), {
  isBusy: computed(() => isFetchingNextPage.value),
  canLoadMore: computed(() => hasNextPage.value ?? false),
})

function handleView(id: string) {
  router.push({ query: buildQuery(filters.value, id) })
}

function handleCloseDetail() {
  router.push({ query: buildQuery(filters.value, null) })
}

function handleTabChange(next: typeof tab.value) {
  tab.value = next
}

function handleSendPaymentInfo(order: IOrderListItem) {
  handleNotifyPaymentInfo(order)
}
</script>

<template>
  <div class="page-view orders-view">
    <div class="page-view__content orders-content">
      <PageHeader title="Pedidos" :subtitle="subtitle" />

      <OrderStatsCards :stats="stats" />

      <OrderStatusTabs
        :active="filters.tab"
        :counts="stats?.tabs"
        @update:active="handleTabChange"
      />

      <OrderFilters />

      <div class="orders-body">
        <div v-if="isError" class="orders-error">
          <NResult
            status="error"
            title="Error al cargar pedidos"
            description="No se pudo obtener la lista de pedidos."
          >
            <template #footer>
              <NButton @click="refetch()">Reintentar</NButton>
            </template>
          </NResult>
        </div>

        <div v-else-if="isPending" class="orders-loading">
          <NSpin size="medium" />
        </div>

        <template v-else-if="orders.length === 0">
          <OperatorEmpty v-if="role === 'operator' && !hasActiveFilters" />
          <FirstRun v-else-if="!hasActiveFilters" />
          <NoResults v-else :query="filters.search" @clear="clearAll()" />
        </template>

        <template v-else>
          <ReceivablesNote
            v-if="showCobrarNote && stats"
            :open-count="stats.openCount"
            :open-amount="stats.openAmount"
            :pending-count="stats.pendingCount"
            :info-sent-count="stats.paymentInfoSentCount"
          />

          <div class="orders-result-line">
            <b>{{ totalOrders.toLocaleString('de-DE') }}</b>
            {{ orderCountLabel }}
            <span class="orders-result-line__sub">
              · {{ customerGroups.length.toLocaleString('de-DE') }} {{ customerCountLabel }}
              cargados · agrupados por cliente · desplaza para cargar más
            </span>
          </div>

          <div class="orders-groups" data-test="orders-list">
            <OrderGroup
              v-for="group in customerGroups"
              :key="group.key"
              :group="group"
              :role="role"
              @view="handleView"
              @confirm-payment="handleConfirmPayment"
              @send-delivery="handleSendDelivery"
              @send-payment-info="handleSendPaymentInfo"
            />

            <div ref="sentinelRef" class="orders-sentinel" aria-hidden="true" />
          </div>

          <div v-if="isFetchingNextPage" class="orders-loading-more">
            <NSpin :size="20" /> <span>Cargando más...</span>
          </div>
          <p v-else-if="!hasNextPage" class="orders-end-marker">No hay más pedidos</p>
        </template>
      </div>
    </div>

    <div v-if="openOrderId" class="orders-detail-host" data-test="order-detail">
      <OrderDetailSheet
        v-if="isMobile"
        :order-id="openOrderId"
        :role="role"
        @close="handleCloseDetail"
      />
      <OrderDetailDrawer
        v-else
        :order-id="openOrderId"
        :role="role"
        @close="handleCloseDetail"
      />
    </div>
  </div>
</template>

<style scoped src="./orders-list-view.css" />
