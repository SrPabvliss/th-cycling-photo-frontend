<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import PageHeader from '@/shared/components/PageHeader.vue'
import { useUploadAssetsBatch } from '@/features/event-assets/composables/mutations/use-upload-assets-batch'
import type { EventAssetType } from '@/features/event-assets/types/asset-type'
import { useCreateEvent } from '../../composables/mutations/use-create-event'
import { EVENT_ROUTE_NAMES } from '../../routes'
import { toCreateEventRequest } from '../../mappers/event-form.mapper'
import type { IEventFormData } from '../../types/event-form.types'
import EventForm from '../components/EventForm/EventForm.vue'

const router = useRouter()
const isSubmitting = ref(false)

const { mutateAsync: createEvent } = useCreateEvent()
const { mutateAsync: uploadAssetsBatch } = useUploadAssetsBatch()

async function handleSubmit(formData: IEventFormData, assetFiles?: Map<EventAssetType, File>) {
  isSubmitting.value = true
  try {
    const { id } = await createEvent(toCreateEventRequest(formData))

    if (assetFiles && assetFiles.size > 0) {
      await uploadAssetsBatch({ eventId: id, assetFiles })
    }

    router.push({ name: EVENT_ROUTE_NAMES.LIST })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content event-form-view">
      <div class="event-form-container">
        <PageHeader title="Crear Evento" back-to="/events" />
        <EventForm
          :is-submitting="isSubmitting"
          @submit="handleSubmit"
          @cancel="router.push({ name: EVENT_ROUTE_NAMES.LIST })"
        />
      </div>
    </div>
  </div>
</template>

<style scoped src="./event-form-view.css"></style>
