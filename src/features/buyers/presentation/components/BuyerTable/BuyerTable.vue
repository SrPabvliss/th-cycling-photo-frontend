<script setup lang="ts">
import { NDataTable, NIcon, NTag } from 'naive-ui'
import { LogoWhatsapp } from '@vicons/ionicons5'
import type { DataTableColumns } from 'naive-ui'
import { h } from 'vue'

import { formatDate, formatRelativeTime } from '@/shared/utils/date.utils'
import type { IBuyerListItem } from '../../../types/responses/buyer-list.response'

defineProps<{
  buyers: IBuyerListItem[]
  loading: boolean
}>()

const columns: DataTableColumns<IBuyerListItem> = [
  {
    title: 'Nombre',
    key: 'name',
    render: (row) => {
      const name = [row.firstName, row.lastName].filter(Boolean).join(' ')
      return name || row.email
    },
  },
  {
    title: 'Email',
    key: 'email',
    ellipsis: { tooltip: true },
  },
  {
    title: 'WhatsApp',
    key: 'primaryPhone',
    render: (row) => {
      if (!row.primaryPhone) return '—'
      return h('span', { style: 'display: flex; align-items: center; gap: 4px' }, [
        row.isWhatsapp ? h(NIcon, { component: LogoWhatsapp, size: 14, color: '#25D366' }) : null,
        row.primaryPhone,
      ])
    },
  },
  {
    title: 'País',
    key: 'countryName',
    render: (row) => row.countryName ?? '—',
  },
  {
    title: 'Pedidos',
    key: 'orderCount',
    width: 90,
    render: (row) =>
      h(
        NTag,
        { size: 'small', type: row.orderCount > 0 ? 'primary' : 'default', round: true },
        { default: () => String(row.orderCount) },
      ),
  },
  {
    title: 'Último pedido',
    key: 'lastOrderAt',
    render: (row) => (row.lastOrderAt ? formatRelativeTime(row.lastOrderAt) : '—'),
  },
  {
    title: 'Registrado',
    key: 'createdAt',
    render: (row) => formatDate(row.createdAt),
  },
]
</script>

<template>
  <NDataTable
    :columns="columns"
    :data="buyers"
    :loading="loading"
    :bordered="false"
    :single-line="false"
    size="small"
    striped
  />
</template>
