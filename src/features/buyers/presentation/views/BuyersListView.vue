<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NIcon, NResult, NSpin } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'

import PageHeader from '@/shared/components/PageHeader/PageHeader.vue'
import { useInfiniteScrollTrigger } from '@/shared/composables/use-infinite-scroll-trigger'
import { useBuyersListQuery } from '../../composables/queries/use-buyers-list'
import { useBuyersStatsQuery } from '../../composables/queries/use-buyers-stats'
import {
  BUYER_FILTER_STATE_KEY,
  buyerFiltersToQuery,
  seedBuyerFiltersFromQuery,
  useBuyerFilters,
} from '../../composables/use-buyer-filters'
import { BUYERS_ROUTE_NAMES } from '../../routes'
import type { IBuyerListItem } from '../../types/responses/buyer-list.response'
import BuyerCard from '../components/BuyerCard/BuyerCard.vue'
import BuyerStatsCards from '../components/BuyerStatsCards/BuyerStatsCards.vue'
import BuyerTabs from '../components/BuyerTabs/BuyerTabs.vue'
import BuyerFilterBar from '../components/BuyerFilterBar/BuyerFilterBar.vue'
import BuyerDetailDrawer from '../components/BuyerDetail/BuyerDetailDrawer.vue'
import { formatNumber } from '@/shared/utils/format.utils'

const LIMIT = 20

const route = useRoute()
const router = useRouter()
const isMobile = useMediaQuery('(max-width: 767px)')

const filterState = useBuyerFilters()
provide(BUYER_FILTER_STATE_KEY, filterState)
const { filters, activeChips, clearAll } = filterState

seedBuyerFiltersFromQuery(filterState, route.query)

watch(
  filters,
  (value) => {
    router.replace({ query: buyerFiltersToQuery(value) })
  },
  { deep: true },
)

const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useBuyersListQuery(filters, LIMIT)

const { data: stats } = useBuyersStatsQuery(filters)

const buyers = computed(() => data.value?.pages.flatMap((page) => page.items) ?? [])
const hasFilters = computed(() => activeChips.value.length > 0)
const resultsCount = computed(() => stats.value?.totalBuyers ?? null)

const sentinelRef = useInfiniteScrollTrigger(() => fetchNextPage(), {
  isBusy: computed(() => isFetchingNextPage.value),
  canLoadMore: computed(() => hasNextPage.value ?? false),
})

const responsibleFilterLabel = computed(() => activeChips.value[0]?.label ?? null)

const selectedBuyerId = ref<string | null>(null)
const showDrawer = ref(false)

watch(showDrawer, (isOpen) => {
  if (!isOpen) selectedBuyerId.value = null
})

function openBuyer(buyer: IBuyerListItem) {
  if (isMobile.value) {
    router.push({ name: BUYERS_ROUTE_NAMES.DETAIL, params: { id: buyer.id } })
    return
  }
  selectedBuyerId.value = buyer.id
  showDrawer.value = true
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content buyers-content">
      <PageHeader
        title="Compradores"
        subtitle="Todas las personas registradas para comprar fotografías"
      />

      <BuyerStatsCards :stats="stats" />

      <div class="buyers-panel">
        <BuyerTabs :tabs="stats?.tabs" />
        <BuyerFilterBar :results-count="resultsCount" />

        <div class="buyers-result-line">
          <template v-if="resultsCount != null">
            <b>{{ formatNumber(resultsCount) }}</b>
            compradores{{ hasFilters ? ' con los filtros aplicados' : '' }}
            <span v-if="!hasFilters" class="buyers-result-line__sub">
              · desplaza para cargar más</span
            >
          </template>
          <span v-else class="buyers-result-line__sub">Cargando compradores…</span>
        </div>

        <div v-if="isPending" class="buyers-loading">
          <NSpin size="medium" />
        </div>

        <NResult
          v-else-if="isError"
          status="error"
          title="Error al cargar compradores"
          description="No se pudo obtener la lista de compradores."
        >
          <template #footer>
            <NButton @click="refetch()">Reintentar</NButton>
          </template>
        </NResult>

        <div v-else-if="buyers.length === 0" class="buyers-empty">
          <span class="buyers-empty__icon">
            <NIcon :component="SearchOutline" :size="22" />
          </span>
          <b v-if="hasFilters">Ningún comprador coincide con los filtros</b>
          <b v-else>Todavía no hay compradores registrados</b>
          <span v-if="hasFilters" class="buyers-empty__hint">
            Prueba quitando {{ responsibleFilterLabel
            }}{{ activeChips.length > 1 ? ' o el resto de los filtros aplicados' : '' }}.
          </span>
          <span v-else class="buyers-empty__hint">
            Las personas que se registren para comprar fotografías aparecerán aquí.
          </span>
          <NButton v-if="hasFilters" class="buyers-empty__clear" @click="clearAll()">
            Limpiar filtros
          </NButton>
        </div>

        <template v-else>
          <div class="buyers-grid">
            <BuyerCard
              v-for="buyer in buyers"
              :key="buyer.id"
              :buyer="buyer"
              @open="openBuyer(buyer)"
            />
          </div>

          <div ref="sentinelRef" class="buyers-sentinel" aria-hidden="true" />

          <div v-if="isFetchingNextPage" class="buyers-loading-more">
            <NSpin :size="20" /> <span>Cargando más compradores…</span>
          </div>
        </template>
      </div>
    </div>

    <BuyerDetailDrawer v-model:show="showDrawer" :buyer-id="selectedBuyerId" />
  </div>
</template>

<style scoped src="./buyers-list-view.css" />
