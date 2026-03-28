<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NPagination, NResult, NSpin } from 'naive-ui'

import PageHeader from '@/shared/components/PageHeader.vue'
import { openWhatsApp, buildPaymentTemplate } from '@/shared/utils/whatsapp.utils'
import {
  useOrdersListQuery,
  type IOrderListFilters,
} from '../../composables/queries/use-orders-list'
import { useOrdersStatsQuery } from '../../composables/queries/use-orders-stats'
import { useOrderActions } from '../../composables/use-order-actions'
import type { OrderStatus, IOrderListItem } from '../../types/responses/order-list.response'
import { ORDER_ROUTE_NAMES } from '../../routes'
import OrderStatsCards from '../components/OrderStatsCards/OrderStatsCards.vue'
import OrderStatusTabs from '../components/OrderStatusTabs/OrderStatusTabs.vue'
import OrderFilters from '../components/OrderFilters/OrderFilters.vue'
import OrderCard from '../components/OrderCard/OrderCard.vue'

const router = useRouter()

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

function handleSendWhatsApp(order: IOrderListItem) {
  const firstName = order.customerName.split(' ')[0] ?? order.customerName
  openWhatsApp(
    order.customerWhatsapp,
    buildPaymentTemplate({
      customerFirstName: firstName,
      photoCount: order.photoCount,
      eventName: order.eventName,
    }),
  )
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
            @send-whats-app="handleSendWhatsApp"
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
