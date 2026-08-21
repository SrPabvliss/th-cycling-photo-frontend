<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon, NResult, NSkeleton } from 'naive-ui'
import { ImagesOutline } from '@vicons/ionicons5'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { useMyOrdersQuery } from '../../composables/queries/use-my-orders'
import OrderCard from '../components/OrderCard/OrderCard.vue'
import OrdersSummary from '../components/OrdersSummary/OrdersSummary.vue'

const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useMyOrdersQuery()

const orders = computed(() => data.value?.pages.flatMap((page) => page.items) ?? [])

const hasOrders = computed(() => orders.value.length > 0)
</script>

<template>
  <PublicLayout>
    <div class="my-orders-view">
      <h1 class="my-orders-view__title">Mis compras</h1>

      <OrdersSummary v-if="isPending || hasOrders" class="my-orders-view__summary" />

      <NSkeleton v-if="isPending" text :repeat="4" />

      <NResult
        v-else-if="isError"
        status="error"
        title="No pudimos cargar tus compras"
        description="Intenta de nuevo en unos segundos."
      >
        <template #footer>
          <NButton @click="refetch()">Reintentar</NButton>
        </template>
      </NResult>

      <template v-else-if="orders.length > 0">
        <div class="my-orders-view__grid">
          <OrderCard v-for="order in orders" :key="order.id" :order="order" />
        </div>

        <NButton
          v-if="hasNextPage"
          class="my-orders-view__load-more"
          :loading="isFetchingNextPage"
          :disabled="isFetchingNextPage"
          @click="fetchNextPage()"
        >
          Cargar más
        </NButton>
      </template>

      <div v-else class="my-orders-view__empty">
        <div class="my-orders-view__empty-icon">
          <NIcon :component="ImagesOutline" :size="36" />
        </div>
        <h2 class="my-orders-view__empty-title">Aquí aparecerán tus órdenes</h2>
        <p class="my-orders-view__empty-text">
          Todavía no has comprado fotos. En cuanto compres, tus órdenes van a aparecer en esta
          pantalla.
        </p>
        <RouterLink to="/gallery">
          <NButton type="primary" size="large">Ir a la galería</NButton>
        </RouterLink>
      </div>
    </div>
  </PublicLayout>
</template>

<style scoped src="./styles/my-orders-view.css"></style>
