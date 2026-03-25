<script setup lang="ts">
import { ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { NCard } from 'naive-ui'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { b2UploadClient } from '@/core/http/b2-upload-client'
import PageHeader from '@/shared/components/PageHeader.vue'
import { useCreateEvent } from '../../composables/mutations/use-create-event'
import { EVENT_QUERY_KEYS } from '../../constants/query-keys'
import { EVENT_ROUTE_NAMES } from '../../routes'
import { toCreateEventRequest } from '../../mappers/event-form.mapper'
import type { IEventFormData } from '../../types/event-form.types'
import type { IApiCoverPresignedUrl } from '../../types/responses/cover-presigned-url.response'
import EventForm from '../components/EventForm/EventForm.vue'

const router = useRouter()
const queryClient = useQueryClient()
const isSubmitting = ref(false)

const { mutateAsync: createEvent } = useCreateEvent()

async function uploadCoverImage(eventId: string, file: File): Promise<void> {
  const { data: presigned } = await httpClient.post<IApiCoverPresignedUrl>(
    API_ROUTES.EVENTS.COVER_PRESIGNED_URL(eventId),
    { fileName: file.name, contentType: file.type },
    { silent: true },
  )

  await b2UploadClient.put(presigned.url, file, {
    headers: { 'Content-Type': file.type },
  })

  await httpClient.post(
    API_ROUTES.EVENTS.COVER_CONFIRM(eventId),
    { storageKey: presigned.objectKey },
    { silent: true },
  )
}

async function handleSubmit(formData: IEventFormData, coverFile?: File) {
  isSubmitting.value = true
  try {
    const { id } = await createEvent(toCreateEventRequest(formData))

    if (coverFile) {
      await uploadCoverImage(id, coverFile)
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.all() })
    }

    router.push({ name: EVENT_ROUTE_NAMES.LIST })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content form-content">
      <PageHeader title="Crear Evento" back-to="/events" />
      <NCard>
        <template #header>
          <div>
            <div class="form-header__title">Información del Evento</div>
            <p class="form-header__subtitle">
              Complete los detalles para configurar el espacio de trabajo de clasificación de fotos.
            </p>
          </div>
        </template>

        <EventForm
          :is-submitting="isSubmitting"
          @submit="handleSubmit"
          @cancel="router.push({ name: EVENT_ROUTE_NAMES.LIST })"
        />
      </NCard>
    </div>
  </div>
</template>

<style scoped src="./event-form-view.css"></style>
