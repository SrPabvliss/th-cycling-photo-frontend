<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NTabs, NTabPane, NButton, NIcon, NSpin, NResult, NEmpty } from 'naive-ui'
import { PlayOutline } from '@vicons/ionicons5'
import { useQueryClient } from '@tanstack/vue-query'

import { CLASSIFICATION_ROUTE_NAMES } from '@/features/classifications/routes'
import { useRetouchQueueQuery } from '../../composables/queries/use-retouch-queue'
import { OPERATOR_QUERY_KEYS } from '../../constants/query-keys'
import RetouchOrderGroup from '../components/RetouchOrderGroup/RetouchOrderGroup.vue'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const eventId = computed(() => route.params.eventId as string)
const activeTab = ref('retouch')

const {
  data: retouchOrders,
  isLoading: isRetouchLoading,
  error: retouchError,
} = useRetouchQueueQuery(eventId)

function goToClassification() {
  router.push({
    name: CLASSIFICATION_ROUTE_NAMES.WORKSPACE,
    params: { eventId: eventId.value },
  })
}

function handlePhotoUploaded() {
  queryClient.invalidateQueries({
    queryKey: OPERATOR_QUERY_KEYS.retouchQueue(eventId.value),
  })
}

const pendingCount = computed(() => {
  if (!retouchOrders.value) return 0
  return retouchOrders.value.reduce(
    (sum, order) => sum + (order.totalItems - order.retouchedItems),
    0,
  )
})
</script>

<template>
  <div class="event-workspace">
    <div class="event-workspace__header">
      <NButton quaternary @click="router.push('/operator')"> ← Volver al dashboard </NButton>
    </div>

    <NTabs v-model:value="activeTab" type="line" class="event-workspace__tabs">
      <NTabPane name="classification" tab="Clasificación">
        <div class="event-workspace__classify-pane">
          <p class="event-workspace__classify-desc">
            Abre el workspace inmersivo para clasificar las fotos de este evento.
          </p>
          <NButton type="primary" @click="goToClassification">
            <template #icon><NIcon :component="PlayOutline" /></template>
            Ir a Clasificación
          </NButton>
        </div>
      </NTabPane>

      <NTabPane
        name="retouch"
        :tab="`Cola de Retoque${pendingCount > 0 ? ` (${pendingCount})` : ''}`"
      >
        <NSpin :show="isRetouchLoading">
          <NResult v-if="retouchError" status="error" title="Error al cargar la cola" />

          <NEmpty
            v-else-if="retouchOrders && retouchOrders.length === 0"
            description="No hay fotos pendientes de retoque"
          />

          <div v-else-if="retouchOrders" class="event-workspace__queue">
            <RetouchOrderGroup
              v-for="order in retouchOrders"
              :key="order.orderId"
              :order="order"
              @uploaded="handlePhotoUploaded"
            />
          </div>
        </NSpin>
      </NTabPane>
    </NTabs>
  </div>
</template>

<style scoped src="./styles/operator-event-workspace-view.css" />
