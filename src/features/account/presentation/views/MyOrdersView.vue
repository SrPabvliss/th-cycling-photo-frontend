<script setup lang="ts">
import { computed } from 'vue'
import { NButton } from 'naive-ui'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { EmptyState } from '@/shared/components/empty-state'
import { LoadBoundary } from '@/shared/components/loading'
import { useInfiniteScrollTrigger } from '@/shared/composables/use-infinite-scroll-trigger'
import { useVisiblePolling } from '@/shared/composables/use-visible-polling'
import { useMyOrdersQuery } from '../../composables/queries/use-my-orders'
import OrderRow from '../components/OrderRow/OrderRow.vue'
import OrderRowSkeleton from '../components/OrderRowSkeleton/OrderRowSkeleton.vue'

const SKELETON_ROWS = 4
const NEXT_PAGE_SKELETONS = 2
/** Below this many orders the end of the list needs no words. */
const SAY_THE_END_FROM = 7
/** While a payment is being confirmed, the list is read again this often. */
const CONFIRMING_POLL_MS = 15_000

const {
  status,
  data,
  isFetching,
  isFetchingNextPage,
  isFetchNextPageError,
  hasNextPage,
  refetch,
  fetchNextPage,
} = useMyOrdersQuery()

const orders = computed(() => data.value?.pages.flatMap((page) => page.items) ?? [])

const canLoadMore = computed(() => hasNextPage.value && !isFetchNextPageError.value)
const sentinel = useInfiniteScrollTrigger(() => fetchNextPage(), {
  isBusy: isFetching,
  canLoadMore,
})
const isAtTheEnd = computed(() => !hasNextPage.value && orders.value.length >= SAY_THE_END_FROM)

const anyConfirming = computed(() => orders.value.some((order) => order.state === 'confirming'))
useVisiblePolling(anyConfirming, CONFIRMING_POLL_MS, () => refetch())
</script>

<template>
  <div class="my-orders">
    <h1 class="my-orders__title">Mis fotos</h1>

    <LoadBoundary
      :status="status"
      :empty="orders.length === 0"
      :refreshing="status === 'error' && isFetching"
      error-title="No pudimos cargar tus fotos"
      error-text="Puede ser tu conexión."
      @retry="refetch()"
    >
      <template #skeleton>
        <div class="my-orders__list" aria-label="Cargando tus compras">
          <OrderRowSkeleton v-for="row in SKELETON_ROWS" :key="row" />
        </div>
      </template>

      <template #empty>
        <EmptyState
          illustration="sinCompras"
          title="Todavía no tienes fotos"
          text="Cuando compres fotos de una carrera, aparecen aquí para descargarlas cuando quieras."
        >
          <template #actions>
            <RouterLink v-slot="{ href, navigate }" :to="ROUTE_PATHS.PUBLIC_GALLERY" custom>
              <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
                Buscar mis fotos
              </NButton>
            </RouterLink>
          </template>
        </EmptyState>
      </template>

      <div class="my-orders__list">
        <OrderRow v-for="order in orders" :key="order.id" :order="order" />
        <template v-if="isFetchingNextPage">
          <OrderRowSkeleton v-for="row in NEXT_PAGE_SKELETONS" :key="`next-${row}`" />
        </template>
      </div>

      <div v-if="canLoadMore" ref="sentinel" class="my-orders__sentinel" aria-hidden="true" />

      <div v-if="hasNextPage && isFetchNextPageError" class="my-orders__more">
        <NButton size="large" @click="fetchNextPage()">Cargar más</NButton>
      </div>

      <p v-if="isAtTheEnd" class="my-orders__end">Esas son todas tus compras.</p>
    </LoadBoundary>
  </div>
</template>

<style scoped src="./styles/my-orders-view.css"></style>
