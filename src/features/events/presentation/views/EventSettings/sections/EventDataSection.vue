<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NResult } from 'naive-ui'

import { useEventAssetsQuery } from '@/features/event-assets/composables/queries/use-event-assets'
import { useUploadAssetsBatch } from '@/features/event-assets/composables/mutations/use-upload-assets-batch'
import { useRemoveAssetsBatch } from '@/features/event-assets/composables/mutations/use-remove-assets-batch'
import { useSetAssetFocalPoint } from '@/features/event-assets/composables/mutations/use-set-asset-focal-point'
import { usePhotoCategoriesQuery } from '@/features/photo-categories/composables/queries/use-photo-categories'
import { useAssignPhotoCategoriesBatch } from '@/features/photo-categories/composables/mutations/use-assign-photo-categories-batch'
import { useUnassignPhotoCategoriesBatch } from '@/features/photo-categories/composables/mutations/use-unassign-photo-categories-batch'
import { useEventDetailQuery } from '@/shared/composables/use-event-detail'
import FrozenBlockedPanel from '../../../components/FrozenBlockedPanel/FrozenBlockedPanel.vue'
import { EVENT_ROUTE_NAMES } from '../../../../routes'
import { useUpdateEvent } from '../../../../composables/mutations/use-update-event'
import { toEventFormData, toUpdateEventRequest } from '../../../../mappers/event-form.mapper'
import type { IEventFormData, IEventFormExtra } from '../../../../types/event-form.types'
import EventForm from '../../../components/EventForm/EventForm.vue'
import EventFormSkeleton from '../../../components/EventFormSkeleton/EventFormSkeleton.vue'

const props = defineProps<{
  slug: string
}>()

const router = useRouter()
const slug = computed(() => props.slug)

const { data: event, isPending, isError, refetch } = useEventDetailQuery(slug)

const id = computed(() => event.value?.id ?? '')

const { data: assets } = useEventAssetsQuery(id)
const { data: assignedCategories } = usePhotoCategoriesQuery(id)
const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateEvent(id)
const { mutateAsync: uploadAssetsBatch } = useUploadAssetsBatch()
const { mutateAsync: setAssetFocalPoint } = useSetAssetFocalPoint(id.value)
const { mutateAsync: removeAssetsBatch } = useRemoveAssetsBatch()
const { mutateAsync: assignCategoriesBatch } = useAssignPhotoCategoriesBatch()
const { mutateAsync: unassignCategoriesBatch } = useUnassignPhotoCategoriesBatch()

const initialData = computed<IEventFormData | undefined>(() => {
  if (!event.value) return undefined
  return toEventFormData(event.value)
})

const initialCategoryIds = computed(() => assignedCategories.value?.map((c) => c.id) ?? [])

const isBlocked = computed(() => event.value?.isFrozen || event.value?.status === 'archived')

const blockedMessage = computed(() =>
  event.value?.isFrozen
    ? 'Este evento está congelado, así que sus datos no se pueden editar.'
    : 'Este evento está archivado, así que sus datos no se pueden editar.',
)

async function handleSubmit(formData: IEventFormData, extra: IEventFormExtra) {
  await updateEvent(toUpdateEventRequest(formData))

  const promises: Promise<unknown>[] = []

  if (extra.assetRemovals && extra.assetRemovals.length > 0) {
    promises.push(removeAssetsBatch({ eventId: id.value, assetTypes: extra.assetRemovals }))
  }

  if (extra.assetFiles && extra.assetFiles.size > 0) {
    promises.push(
      uploadAssetsBatch({
        eventId: id.value,
        assetFiles: extra.assetFiles,
        focalPoints: extra.assetFocalPoints,
      }),
    )
  } else if (extra.assetFocalPoints) {
    // Reframing an image that is already uploaded travels on its own: there is no file to send.
    extra.assetFocalPoints.forEach((point, assetType) => {
      promises.push(setAssetFocalPoint({ assetType, ...point }))
    })
  }

  if (extra.categoryIds && assignedCategories.value) {
    const currentIds = new Set(assignedCategories.value.map((c) => c.id))
    const desiredIds = new Set(extra.categoryIds)

    const toAssign = extra.categoryIds.filter((catId: number) => !currentIds.has(catId))
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

  await Promise.all(promises)
}
</script>

<template>
  <div class="event-data-section">
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

    <FrozenBlockedPanel v-else-if="isBlocked" :message="blockedMessage">
      <NButton type="primary" @click="router.push('/events/' + slug)">Volver al evento</NButton>
    </FrozenBlockedPanel>

    <EventForm
      v-else-if="event && initialData"
      :initial-data="initialData"
      :existing-assets="assets"
      :initial-category-ids="initialCategoryIds"
      :is-submitting="isUpdating"
      submit-label="Guardar Cambios"
      @submit="handleSubmit"
      @cancel="router.push({ name: EVENT_ROUTE_NAMES.DETAIL, params: { slug: slug } })"
    />
  </div>
</template>

<style scoped src="./event-data-section.css" />
