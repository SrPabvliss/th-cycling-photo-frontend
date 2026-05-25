<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NPagination, NResult, NSpin, useMessage } from 'naive-ui'
import { useQueryClient } from '@tanstack/vue-query'

import PageHeader from '@/shared/components/PageHeader.vue'
import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import {
  openWhatsApp,
  buildPaymentInfoTemplate,
  buildDeliveryTemplate,
} from '@/shared/utils/whatsapp.utils'
import {
  useOrdersListQuery,
  type IOrderListFilters,
} from '../../composables/queries/use-orders-list'
import { useOrdersStatsQuery } from '../../composables/queries/use-orders-stats'
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

const router = useRouter()
const message = useMessage()
const queryClient = useQueryClient()

const ORDERS_PER_PAGE = 15

const filters = ref<IOrderListFilters>({
  page: 1,
  status: null,
  eventId: null,
  search: '',
})

const { data, isPending, isError, refetch } = useOrdersListQuery(filters, ORDERS_PER_PAGE)
const { data: stats } = useOrdersStatsQuery()

const { handleConfirmPayment, handleSendDelivery, handleRegenerate } = useOrderActions()

const activeStatus = computed(() => filters.value.status as OrderStatus | null)

function handleStatusChange(status: OrderStatus | null) {
  filters.value = { ...filters.value, status, page: 1 }
}

function handleSearchChange(search: string) {
  filters.value = { ...filters.value, search, page: 1 }
}

function handleEventChange(eventId: string | null) {
  filters.value = { ...filters.value, eventId, page: 1 }
}

function handleView(id: string) {
  router.push({ name: ORDER_ROUTE_NAMES.DETAIL, params: { id } })
}

function handleSendPaymentInfo(order: IOrderListItem) {
  const firstName = order.userName.split(' ')[0] ?? order.userName
  const template = buildPaymentInfoTemplate({
    customerFirstName: firstName,
    photoCount: order.photoCount,
    eventName: order.eventName,
  })
  openWhatsApp(order.snapWhatsapp, template)
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

  const deliveryUrl = `${window.location.origin}/delivery/${detail.deliveryLink.token}`
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

      <div v-else-if="data && data.items.length === 0" class="orders-empty">
        <p>No se encontraron pedidos con estos filtros.</p>
      </div>

      <template v-else-if="data">
        <div class="orders-grid">
          <OrderCard
            v-for="order in data.items"
            :key="order.id"
            :order="order"
            @view="handleView"
            @confirm-payment="handleConfirmPayment"
            @send-delivery="handleSendDelivery"
            @send-payment-info="handleSendPaymentInfo"
            @resend-delivery="handleResendDelivery"
            @regenerate="handleRegenerate"
          />
        </div>

        <div v-if="data.pagination && data.pagination.totalPages > 1" class="orders-pagination">
          <NPagination
            :page="filters.page"
            :page-count="data.pagination.totalPages"
            @update:page="(p: number) => (filters = { ...filters, page: p })"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped src="./orders-list-view.css" />
