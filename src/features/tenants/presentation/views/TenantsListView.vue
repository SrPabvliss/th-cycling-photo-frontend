<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NDataTable, NFlex, NSpin } from 'naive-ui'
import { useTenants } from '../../composables/queries/use-tenants'
import CreateTenantModal from '../modals/CreateTenantModal.vue'
import EditTenantQuotaModal from '../modals/EditTenantQuotaModal.vue'
import type { TenantListResponse } from '../../types/responses/tenant-list.response'

const { data: tenants, isLoading } = useTenants()

const isCreateModalOpen = ref(false)
const editingTenant = ref<TenantListResponse | null>(null)

const columns = [
  { title: 'Name', key: 'name' },
  { title: 'Used Events', key: 'eventsUsed' },
  { title: 'Quota', key: 'eventQuota' },
  {
    title: 'Actions',
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
        { default: () => 'Edit Quota' },
      )
    },
  },
]

// Note: h is available if imported, or we can just use template for columns if not, but naive-ui DataTables usually use render function.
import { h } from 'vue'
</script>

<template>
  <div style="padding: 24px">
    <NFlex justify="space-between" align="center" style="margin-bottom: 24px">
      <div>
        <h1 style="font-size: 24px; font-weight: 600; margin: 0">Tenants</h1>
        <p style="color: #666; margin-top: 4px">Manage tenants and their quotas.</p>
      </div>
      <NButton type="primary" @click="isCreateModalOpen = true"> Create Tenant </NButton>
    </NFlex>

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
</template>
