<script setup lang="ts">
import { ref, watch } from 'vue'
import { NButton, NInput, NFlex, NIcon, NPagination, NResult } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'
import { useDebounceFn } from '@vueuse/core'

import PageHeader from '@/shared/components/PageHeader.vue'
import { useBuyersListQuery } from '../../composables/queries/use-buyers-list'
import BuyerTable from '../components/BuyerTable/BuyerTable.vue'

const page = ref(1)
const search = ref('')
const searchInput = ref('')
const LIMIT = 20

const { data, isPending, isError, refetch } = useBuyersListQuery(page, search, LIMIT)

const debouncedSearch = useDebounceFn((value: string) => {
  search.value = value
  page.value = 1
}, 400)

watch(searchInput, (val) => debouncedSearch(val))
</script>

<template>
  <div class="page-view">
    <div class="page-view__content buyers-content">
      <PageHeader title="Compradores" subtitle="Usuarios registrados como clientes" />

      <NFlex justify="space-between" align="center" style="margin-bottom: 16px">
        <NInput
          v-model:value="searchInput"
          placeholder="Buscar por nombre, email o teléfono..."
          clearable
          style="max-width: 360px"
        >
          <template #prefix>
            <NIcon :component="SearchOutline" />
          </template>
        </NInput>

        <NPagination
          v-if="data && data.pagination.totalPages > 1"
          :page="page"
          :page-count="data.pagination.totalPages"
          size="small"
          @update:page="(p: number) => (page = p)"
        />
      </NFlex>

      <div v-if="isError" style="padding: 40px 0">
        <NResult status="error" title="Error al cargar compradores">
          <template #footer><NButton @click="refetch()">Reintentar</NButton></template>
        </NResult>
      </div>

      <BuyerTable v-else :buyers="data?.items ?? []" :loading="isPending" />

      <NFlex
        v-if="data && data.pagination.totalPages > 1"
        justify="center"
        style="margin-top: 16px"
      >
        <NPagination
          :page="page"
          :page-count="data.pagination.totalPages"
          @update:page="(p: number) => (page = p)"
        />
      </NFlex>
    </div>
  </div>
</template>

<style scoped>
.buyers-content {
  padding: 24px 32px;
}
</style>
