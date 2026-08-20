<script setup lang="ts">
import { h, ref } from 'vue'
import { NButton, NDataTable, NSpin } from 'naive-ui'
import PageHeader from '@/shared/components/PageHeader.vue'
import { useTenants } from '../../composables/queries/use-tenants'
import CreateTenantModal from '../modals/CreateTenantModal.vue'
import EditTenantQuotaModal from '../modals/EditTenantQuotaModal.vue'
import type { TenantListResponse } from '../../types/responses/tenant-list.response'

const { data: tenants, isLoading } = useTenants()

const isCreateModalOpen = ref(false)
const editingTenant = ref<TenantListResponse | null>(null)

const columns = [
  { title: 'Nombre', key: 'name' },
  { title: 'Eventos usados', key: 'eventsUsed' },
  { title: 'Cupo', key: 'eventQuota' },
  {
    title: 'Acciones',
    key: 'actions',
    render(row: TenantListResponse) {
      return h(
        NButton,
        {
          size: 'small',
          onClick: () => {
            editingTenant.value = row
          },
        },
        { default: () => 'Editar cupo' },
      )
    },
  },
]
</script>

<template>
  <div class="page-view">
    <div class="page-view__content">
      <PageHeader title="Tenants" subtitle="Gestiona los tenants y sus cupos de eventos">
        <NButton type="primary" @click="isCreateModalOpen = true">Crear tenant</NButton>
      </PageHeader>

      <div v-if="isLoading" style="text-align: center; padding: 40px">
        <NSpin size="large" />
      </div>
      <NDataTable
        v-else
        :columns="columns"
        :data="tenants || []"
        :bordered="false"
        :single-line="false"
      />

      <CreateTenantModal
        :show="isCreateModalOpen"
        @update:show="(val) => (isCreateModalOpen = val)"
      />

      <EditTenantQuotaModal
        v-if="editingTenant"
        :show="!!editingTenant"
        :tenant="editingTenant"
        @update:show="
          (val) => {
            if (!val) editingTenant = null
          }
        "
      />
    </div>
  </div>
</template>
