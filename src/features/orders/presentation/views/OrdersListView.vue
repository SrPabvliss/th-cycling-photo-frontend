<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NEmpty, NResult, NSpin, useMessage } from 'naive-ui'
import { useQueryClient } from '@tanstack/vue-query'

import PageHeader from '@/shared/components/PageHeader.vue'
import { API_ROUTES } from '@/core/api/api-routes'
import { env } from '@/core/config/env'
import { httpClient } from '@/core/http/axios-client'
import { useInfiniteScrollTrigger } from '@/shared/composables/use-infinite-scroll-trigger'
import { openWhatsApp, buildDeliveryTemplate } from '@/shared/utils/whatsapp.utils'
import {
  useOrdersListQuery,
  type IOrderListFilters,
} from '../../composables/queries/use-orders-list'
import { useOrdersStatsQuery } from '../../composables/queries/use-orders-stats'
import { useGroupedOrders } from '../../composables/use-grouped-orders'
import { useOrderActions } from '../../composables/use-order-actions'
import { ORDER_QUERY_KEYS } from '../../constants/query-keys'
import { toOrderDetail } from '../../mappers/order-detail.mapper'
import type { IApiOrderDetail } from '../../types/responses/order-detail.response'
import type { OrderStatus, IOrderListItem } from '../../types/responses/order-list.response'
import { ORDER_ROUTE_NAMES } from '../../routes'
import OrderStatsCards from '../components/OrderStatsCards/OrderStatsCards.vue'
import OrderStatusTabs from '../components/OrderStatusTabs/OrderStatusTabs.vue'
import OrderFilters from '../components/OrderFilters/OrderFilters.vue'
import OrderCard from '../components/OrderCard/OrderCard.vue'
import OrderCustomerSeparator from '../components/OrderCustomerSeparator/OrderCustomerSeparator.vue'

const router = useRouter()
const message = useMessage()
const queryClient = useQueryClient()

const ORDERS_PER_PAGE = 15

const filters = ref<IOrderListFilters>({
  status: null,
  eventId: null,
  search: '',
})

const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useOrdersListQuery(filters, ORDERS_PER_PAGE)
const statsEventId = computed(() => filters.value.eventId)
const { data: stats } = useOrdersStatsQuery(statsEventId)

const {
  handleConfirmPayment,
  handleMarkGift,
  handleNotifyPaymentInfo,
  handleSendDelivery,
  handleRegenerate,
} = useOrderActions()

const activeStatus = computed(() => filters.value.status as OrderStatus | null)

const orders = computed<IOrderListItem[]>(() => data.value?.pages.flatMap((p) => p.items) ?? [])

const rows = useGroupedOrders(orders)

const sentinelRef = useInfiniteScrollTrigger(() => fetchNextPage(), {
  isBusy: computed(() => isFetchingNextPage.value),
  canLoadMore: computed(() => hasNextPage.value ?? false),
})

function handleStatusChange(status: OrderStatus | null) {
  filters.value = { ...filters.value, status }
}

function handleSearchChange(search: string) {
  filters.value = { ...filters.value, search }
}

function handleEventChange(eventId: string | null) {
  filters.value = { ...filters.value, eventId }
}

function handleView(id: string) {
  router.push({ name: ORDER_ROUTE_NAMES.DETAIL, params: { id } })
}

function handleSendPaymentInfo(order: IOrderListItem) {
  handleNotifyPaymentInfo(order)
}

async function handleResendDelivery(order: IOrderListItem) {
  // Card only carries hasDeliveryLink boolean. Fetch detail to get the
  // token (cached by TanStack Query, so repeat clicks are free).
  const detail = await queryClient.fetchQuery({
    queryKey: ORDER_QUERY_KEYS.detail(order.id),
    queryFn: async () => {
      const response = await httpClient.get<IApiOrderDetail>(API_ROUTES.ORDERS.GET_BY_ID(order.id))
      return toOrderDetail(response.data)
    },
  })

  if (!detail.deliveryLink) {
    message.error('No se encontró el enlace de descarga.')
    return
  }

  const deliveryUrl = `${env.VITE_APP_BASE_URL}/delivery/${detail.deliveryLink.token}`
  const template = buildDeliveryTemplate({
    customerFirstName: detail.snapFirstName ?? detail.userName,
    photoCount: detail.photos.length,
    deliveryUrl,
  })
  openWhatsApp(order.snapWhatsapp, template)
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content list-content">
      <PageHeader
        title="Gestión de Pedidos"
        subtitle="Administra pagos, entregas y comunicación con clientes"
      />

      <OrderStatsCards :stats="stats" />

      <div class="orders-list-view__header">
        <OrderStatusTabs
          :active-status="activeStatus"
          :stats="stats"
          @update:active-status="handleStatusChange"
        />

        <OrderFilters
          :search="filters.search"
          :event-id="filters.eventId"
          @update:search="handleSearchChange"
          @update:event-id="handleEventChange"
        />
      </div>

      <div v-if="isPending" class="orders-loading">
        <NSpin size="medium" />
      </div>

      <NResult
        v-else-if="isError"
        status="error"
        title="Error al cargar pedidos"
        description="No se pudo obtener la lista de pedidos."
      >
        <template #footer>
          <NButton @click="refetch()">Reintentar</NButton>
        </template>
      </NResult>

      <div v-else-if="orders.length === 0" class="orders-empty">
        <NEmpty description="No hay órdenes que coincidan con los filtros" />
      </div>

      <template v-else>
        <div class="orders-grid">
          <template v-for="row in rows" :key="row.key">
            <OrderCustomerSeparator
              v-if="row.type === 'separator'"
              :label="row.customerLabel"
              :phone="row.customerPhone"
              :order-count="row.orderCount"
            />
            <OrderCard
              v-else
              :order="row.order"
              :group-position="row.positionInGroup"
              :group-total="row.totalInGroup"
              :is-latest-for-customer="row.isLatestForCustomer"
              @view="handleView"
              @confirm-payment="handleConfirmPayment"
              @mark-gift="handleMarkGift"
              @send-delivery="handleSendDelivery"
              @send-payment-info="handleSendPaymentInfo"
              @resend-delivery="handleResendDelivery"
              @regenerate="handleRegenerate"
            />
          </template>

          <div ref="sentinelRef" class="orders-sentinel" aria-hidden="true" />
        </div>

        <div v-if="isFetchingNextPage" class="orders-loading-more">
          <NSpin :size="20" /> <span>Cargando más...</span>
        </div>
        <p v-else-if="!hasNextPage && orders.length > 0" class="orders-end-marker">
          No hay más órdenes
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped src="./orders-list-view.css" />
