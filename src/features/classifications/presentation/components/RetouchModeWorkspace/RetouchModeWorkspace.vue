<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NEmpty, NResult, NSpin } from 'naive-ui'

import { usePhotoDetailQuery } from '@/features/photos/composables/queries/use-photo-detail'
import { OPERATOR_PATH } from '@/features/operator/routes'
import { useRetouchMode } from '../../../composables/use-retouch-mode'
import WorkspaceHeader from '../WorkspaceHeader/WorkspaceHeader.vue'
import WorkspacePhotoPanel from '../WorkspacePhotoPanel/WorkspacePhotoPanel.vue'
import CyclistList from '../CyclistList/CyclistList.vue'
import RetouchOrderPhotos from '../RetouchOrderPhotos/RetouchOrderPhotos.vue'
import RetouchOrderInfo from '../RetouchOrderInfo/RetouchOrderInfo.vue'

const props = defineProps<{
  eventId: string
}>()

const eventIdRef = computed(() => props.eventId)
const enabled = ref(true)
const retouch = useRetouchMode(eventIdRef, enabled)
const showClassification = ref(false)

const retouchPhotoId = computed(() => retouch.currentPhotoId.value ?? '')
const { data: retouchPhoto, isPending: isRetouchPhotoPending } = usePhotoDetailQuery(retouchPhotoId)

const activePhotoId = computed(() => retouch.currentPhotoId.value)

function handleRetouchUploadSuccess(photoId: string) {
  retouch.onPhotoUploaded(photoId)
}
</script>

<template>
  <WorkspaceHeader
    :breadcrumbs="[{ label: 'Dashboard', to: OPERATOR_PATH }, { label: 'Retoque' }]"
    :progress="{
      current: retouch.orderProgress.value.retouched,
      total: retouch.orderProgress.value.total,
    }"
    :event-id="eventId"
    :classified-count="retouch.orderProgress.value.retouched"
    :total-photos="retouch.orderProgress.value.total"
  />

  <div v-if="retouch.isLoading.value" class="workspace__loading">
    <NSpin size="large" />
  </div>

  <div v-else-if="retouch.error.value" class="workspace__error">
    <NResult
      status="error"
      title="Error al cargar"
      description="No se pudo cargar la cola de retoque."
    />
  </div>

  <div v-else-if="retouch.allDone.value" class="workspace__empty">
    <NEmpty description="Todas las órdenes están retocadas">
      <template #extra>
        <NButton @click="$router.push(OPERATOR_PATH)">Volver al dashboard</NButton>
      </template>
    </NEmpty>
  </div>

  <div v-else-if="retouch.currentOrder.value" class="workspace__body">
    <div class="workspace__left-panel">
      <RetouchOrderPhotos
        :photos="retouch.orderPhotos.value"
        :current-photo-id="retouch.currentPhotoId.value"
        :buyer-name="retouch.currentOrder.value.buyerName"
        :progress="retouch.orderProgress.value"
        :is-photo-retouched="retouch.isPhotoRetouched"
        @select="retouch.selectPhoto"
      />
    </div>

    <div class="workspace__photo">
      <WorkspacePhotoPanel
        v-if="retouchPhoto"
        :photo="retouchPhoto"
        :has-next="retouch.hasNext.value"
        :has-prev="retouch.hasPrev.value"
        @next="retouch.goNext"
        @prev="retouch.goPrev"
        @retouched="handleRetouchUploadSuccess"
      />
      <div v-if="isRetouchPhotoPending" class="workspace__photo-overlay">
        <NSpin size="large" />
      </div>
    </div>

    <div class="workspace__sidebar">
      <RetouchOrderInfo
        :order="retouch.currentOrder.value"
        :progress="retouch.orderProgress.value"
        :show-classification="showClassification"
        :total-orders="retouch.totalOrders.value"
        @update:show-classification="showClassification = $event"
      />

      <template v-if="showClassification && activePhotoId">
        <CyclistList :photo-id="activePhotoId" />
      </template>
    </div>
  </div>
</template>
