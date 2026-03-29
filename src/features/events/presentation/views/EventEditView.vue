<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NResult } from 'naive-ui'

import PageHeader from '@/shared/components/PageHeader.vue'
import { useEventAssetsQuery } from '@/features/event-assets/composables/queries/use-event-assets'
import { useUploadAssetsBatch } from '@/features/event-assets/composables/mutations/use-upload-assets-batch'
import { useRemoveAssetsBatch } from '@/features/event-assets/composables/mutations/use-remove-assets-batch'
import type { EventAssetType } from '@/features/event-assets/types/asset-type'
import { useEventDetailQuery } from '../../composables/queries/use-event-detail'
import { EVENT_ROUTE_NAMES } from '../../routes'
import { useUpdateEvent } from '../../composables/mutations/use-update-event'
import { toEventFormData, toUpdateEventRequest } from '../../mappers/event-form.mapper'
import type { IEventDetail } from '../../types/responses/event-detail.response'
import type { IEventFormData } from '../../types/event-form.types'
import EventForm from '../components/EventForm/EventForm.vue'
import EventFormSkeleton from '../components/EventFormSkeleton/EventFormSkeleton.vue'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as IEventDetail['id'])

const { data: event, isPending, isError, refetch } = useEventDetailQuery(id)
const { data: assets } = useEventAssetsQuery(id)
const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateEvent(id.value)
const { mutateAsync: uploadAssetsBatch } = useUploadAssetsBatch()
const { mutateAsync: removeAssetsBatch } = useRemoveAssetsBatch()

const initialData = computed<IEventFormData | undefined>(() => {
  if (!event.value) return undefined
  return toEventFormData(event.value)
})

async function handleSubmit(
  formData: IEventFormData,
  assetFiles?: Map<EventAssetType, File>,
  assetRemovals?: EventAssetType[],
) {
  await updateEvent(toUpdateEventRequest(formData))

  const promises: Promise<unknown>[] = []

  if (assetRemovals && assetRemovals.length > 0) {
    promises.push(removeAssetsBatch({ eventId: id.value, assetTypes: assetRemovals }))
  }

  if (assetFiles && assetFiles.size > 0) {
    promises.push(uploadAssetsBatch({ eventId: id.value, assetFiles }))
  }

  await Promise.all(promises)
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content event-form-view">
      <div class="event-form-container">
        <PageHeader title="Editar Evento" :back-to="'/events/' + id" />
        <EventFormSkeleton v-if="isPending" />

        <div v-else-if="isError" class="error-container">
          <NResult
            status="error"
            title="Error al cargar evento"
            description="No se pudo obtener el detalle del evento para editar."
          >
            <template #footer>
              <NButton @click="refetch()">Reintentar</NButton>
            </template>
          </NResult>
        </div>

        <EventForm
          v-else-if="event && initialData"
          :initial-data="initialData"
          :existing-assets="assets"
          :is-submitting="isUpdating"
          submit-label="Guardar Cambios"
          @submit="handleSubmit"
          @cancel="router.push({ name: EVENT_ROUTE_NAMES.DETAIL, params: { id: id } })"
        />
      </div>
    </div>
  </div>
</template>

<style scoped src="./event-form-view.css"></style>
