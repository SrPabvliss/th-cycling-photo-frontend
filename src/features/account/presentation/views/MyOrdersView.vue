<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NEmpty, NResult, NSkeleton } from 'naive-ui'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { useMyOrdersQuery } from '../../composables/queries/use-my-orders'
import OrderCard from '../components/OrderCard/OrderCard.vue'

const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useMyOrdersQuery()

const orders = computed(() => data.value?.pages.flatMap((page) => page.items) ?? [])
</script>

<template>
  <PublicLayout>
    <div class="my-orders-view">
      <h1 class="my-orders-view__title">Mis compras</h1>

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
        <div class="my-orders-view__rows">
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

      <NEmpty v-else description="Todavía no tienes compras" class="my-orders-view__empty">
        <template #extra>
          <RouterLink to="/gallery" class="my-orders-view__gallery-link"
            >Ir a la galería</RouterLink
          >
        </template>
      </NEmpty>
    </div>
  </PublicLayout>
</template>

<style scoped src="./styles/my-orders-view.css"></style>
