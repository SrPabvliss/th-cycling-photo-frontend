<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NResult } from 'naive-ui'

import PageHeader from '@/shared/components/PageHeader.vue'
import { useEventAssetsQuery } from '@/features/event-assets/composables/queries/use-event-assets'
import { useUploadAssetsBatch } from '@/features/event-assets/composables/mutations/use-upload-assets-batch'
import { useRemoveAssetsBatch } from '@/features/event-assets/composables/mutations/use-remove-assets-batch'
import { usePhotoCategoriesQuery } from '@/features/photo-categories/composables/queries/use-photo-categories'
import { useAssignPhotoCategoriesBatch } from '@/features/photo-categories/composables/mutations/use-assign-photo-categories-batch'
import { useUnassignPhotoCategoriesBatch } from '@/features/photo-categories/composables/mutations/use-unassign-photo-categories-batch'
import { useSetFeatured } from '../../composables/mutations/use-set-featured'
import { useEventDetailQuery } from '../../composables/queries/use-event-detail'
import { EVENT_ROUTE_NAMES } from '../../routes'
import { useUpdateEvent } from '../../composables/mutations/use-update-event'
import { toEventFormData, toUpdateEventRequest } from '../../mappers/event-form.mapper'
import type { IEventDetail } from '../../types/responses/event-detail.response'
import type { IEventFormData } from '../../types/event-form.types'
import type { IEventFormExtra } from '../components/EventForm/EventForm.vue'
import EventForm from '../components/EventForm/EventForm.vue'
import EventFormSkeleton from '../components/EventFormSkeleton/EventFormSkeleton.vue'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as IEventDetail['id'])

const { data: event, isPending, isError, refetch } = useEventDetailQuery(id)
const { data: assets } = useEventAssetsQuery(id)
const { data: assignedCategories } = usePhotoCategoriesQuery(id)
const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateEvent(id.value)
const { mutateAsync: uploadAssetsBatch } = useUploadAssetsBatch()
const { mutateAsync: removeAssetsBatch } = useRemoveAssetsBatch()
const { mutateAsync: assignCategoriesBatch } = useAssignPhotoCategoriesBatch()
const { mutateAsync: unassignCategoriesBatch } = useUnassignPhotoCategoriesBatch()
const { mutateAsync: setFeatured } = useSetFeatured()

const initialData = computed<IEventFormData | undefined>(() => {
  if (!event.value) return undefined
  return toEventFormData(event.value)
})

const initialCategoryIds = computed(() => assignedCategories.value?.map((c) => c.id) ?? [])

async function handleSubmit(formData: IEventFormData, extra: IEventFormExtra) {
  await updateEvent(toUpdateEventRequest(formData))

  const promises: Promise<unknown>[] = []

  if (extra.assetRemovals && extra.assetRemovals.length > 0) {
    promises.push(removeAssetsBatch({ eventId: id.value, assetTypes: extra.assetRemovals }))
  }

  if (extra.assetFiles && extra.assetFiles.size > 0) {
    promises.push(uploadAssetsBatch({ eventId: id.value, assetFiles: extra.assetFiles }))
  }

  // Sync categories
  if (extra.categoryIds && assignedCategories.value) {
    const currentIds = new Set(assignedCategories.value.map((c) => c.id))
    const desiredIds = new Set(extra.categoryIds)

    const toAssign = extra.categoryIds.filter((catId) => !currentIds.has(catId))
    const toUnassign = assignedCategories.value
      .filter((cat) => !desiredIds.has(cat.id))
      .map((cat) => cat.id)

    if (toAssign.length > 0) {
      promises.push(assignCategoriesBatch({ eventId: id.value, categoryIds: toAssign }))
    }
    if (toUnassign.length > 0) {
      promises.push(unassignCategoriesBatch({ eventId: id.value, categoryIds: toUnassign }))
    }
  }

  // Sync featured
  if (
    event.value &&
    extra.isFeatured !== undefined &&
    extra.isFeatured !== event.value.isFeatured
  ) {
    promises.push(setFeatured({ eventId: id.value, isFeatured: extra.isFeatured }))
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
          :initial-featured="event.isFeatured"
          :initial-category-ids="initialCategoryIds"
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
