<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon, NModal } from 'naive-ui'
import { AlertOutline, CartOutline, TrashOutline } from '@vicons/ionicons5'

import { formatFileSize, formatNumber } from '@/shared/utils/format.utils'
import { formatDate } from '@/shared/utils/date.utils'
import { usePhotoDetailQuery } from '@/features/photos/composables/queries/use-photo-detail'
import type { IPhotoListItem } from '@/features/photos/types/responses/photo-list.response'
import type { IEventDetail } from '@/features/events/types/responses/event-detail.response'
import type { IPhotoOrder } from '@/features/photos/types/responses/photo-detail.response'
import GalleryBibChips from '../components/GalleryBibChips/GalleryBibChips.vue'

const props = defineProps<{
  show: boolean
  photo: IPhotoListItem
  event: IEventDetail
  orders?: IPhotoOrder[]
}>()

const emit = defineEmits<{
  confirm: [id: string]
  close: []
}>()

const photoId = computed(() => (props.show ? props.photo.id : ''))
const { data: detail } = usePhotoDetailQuery(photoId)

const categoryLabel = computed(() => props.photo.photoCategoryName ?? 'Sin categoría')

const metaLine = computed(() => {
  if (!detail.value) return null
  return `${categoryLabel.value} · ${detail.value.width}×${detail.value.height} · ${formatFileSize(detail.value.fileSize)}`
})

const orders = computed(() => props.orders ?? detail.value?.orders ?? [])

function timesWord(count: number): string {
  return count === 2 ? 'dos veces' : `${count} veces`
}

const soldHeadline = computed(() =>
  orders.value.length >= 2
    ? `Esta foto ya se vendió ${timesWord(orders.value.length)}.`
    : 'Esta foto ya se vendió.',
)

const soldBody = computed(() => {
  if (orders.value.length >= 2) {
    const names = orders.value
      .map((order) => `${order.buyerName} (${formatDate(order.createdAt)})`)
      .join(' y ')
    return `Está en ${orders.value.length} pedidos pagados: ${names}. Borrarla no toca esos pedidos, pero quienes la compraron dejan de poder descargarla.`
  }
  return 'Está en un pedido pagado. Borrarla no toca el pedido, pero quien la compró deja de poder descargarla.'
})

const quotaText = computed(() => {
  if (props.event.photoQuota === null) {
    return 'El cupo cuenta cada foto que se subió alguna vez y seguirá igual después de borrar: se libera almacenamiento, no capacidad.'
  }
  return `El cupo cuenta cada foto que se subió alguna vez. Este evento ya lleva ${formatNumber(props.event.photosUploaded)} de ${formatNumber(props.event.photoQuota)} consumidas y seguirá igual después de borrar: se libera almacenamiento, no capacidad.`
})

function close() {
  emit('close')
}

function confirm() {
  emit('confirm', props.photo.id)
}
</script>

<template>
  <NModal :show="show" preset="card" style="width: 560px" @update:show="close">
    <template #header>
      <div class="dpm-head">
        <b>Eliminar esta foto</b>
        <span data-test="delete-subtitle">{{ photo.filename }}</span>
      </div>
    </template>

    <div class="dpm-body">
      <div class="gp-delrow">
        <img :src="photo.thumbnailUrl" :alt="photo.filename" />
        <div>
          <GalleryBibChips :bibs="photo.bibs" />
          <span v-if="metaLine" data-test="delete-meta-line">{{ metaLine }}</span>
        </div>
      </div>

      <div v-if="photo.sold" class="tt-notice red" data-test="sold-notice">
        <NIcon :component="CartOutline" :size="17" />
        <div>
          <b>{{ soldHeadline }}</b>
          <span>{{ soldBody }}</span>
        </div>
      </div>

      <div class="tt-notice amber" data-test="quota-notice">
        <NIcon :component="AlertOutline" :size="17" />
        <div>
          <b>Borrar no devuelve cupo.</b>
          <span>{{ quotaText }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dpm-footer">
        <NButton data-test="delete-cancel" @click="close">Cancelar</NButton>
        <NButton type="error" ghost data-test="delete-confirm" @click="confirm">
          <template #icon>
            <NIcon :component="TrashOutline" :size="13" data-test="delete-confirm-icon" />
          </template>
          Eliminar
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./delete-photo-modal.css" />
