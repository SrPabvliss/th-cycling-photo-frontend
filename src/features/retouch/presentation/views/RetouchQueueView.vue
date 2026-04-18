<script setup lang="ts">
import { NButton, NEmpty, NFlex, NIcon, NResult, NSpin } from 'naive-ui'
import { BrushOutline } from '@vicons/ionicons5'

import PageHeader from '@/shared/components/PageHeader.vue'
import { usePendingRetouchQuery } from '../../composables/queries/use-pending-retouch'
import RetouchOrderGroup from '../components/RetouchOrderGroup/RetouchOrderGroup.vue'

const { data: groups, isPending, isError, refetch } = usePendingRetouchQuery()
</script>

<template>
  <div class="page-view">
    <div class="page-view__content retouch-content">
      <PageHeader
        title="Cola de Retoque"
        subtitle="Fotos pendientes de edición, ordenadas por fecha de pedido"
      />

      <div v-if="isPending" style="display: flex; justify-content: center; padding: 60px 0">
        <NSpin size="large" />
      </div>

      <div v-else-if="isError" style="display: flex; justify-content: center; padding: 60px 0">
        <NResult
          status="error"
          title="Error al cargar la cola"
          description="No se pudo obtener las fotos pendientes."
        >
          <template #footer><NButton @click="refetch()">Reintentar</NButton></template>
        </NResult>
      </div>

      <template v-else-if="groups && groups.length > 0">
        <NFlex vertical :size="16">
          <RetouchOrderGroup v-for="group in groups" :key="group.orderId" :group="group" />
        </NFlex>
      </template>

      <NEmpty v-else style="padding: 80px 0">
        <template #icon>
          <NIcon :component="BrushOutline" :size="48" color="var(--tt-neutral-light)" />
        </template>
        <template #default>No hay fotos pendientes de retoque</template>
        <template #extra>
          <span style="font-size: 13px; color: var(--tt-neutral-mid)">
            Las fotos aparecerán aquí cuando se confirmen pagos de pedidos.
          </span>
        </template>
      </NEmpty>
    </div>
  </div>
</template>

<style scoped src="./retouch-queue-view.css" />
