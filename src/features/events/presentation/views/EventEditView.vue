<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NCard, NResult } from 'naive-ui'

import PageHeader from '@/shared/components/PageHeader.vue'
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
const { mutate, isPending: isUpdating } = useUpdateEvent(id.value)

const initialData = computed<IEventFormData | undefined>(() => {
  if (!event.value) return undefined
  return toEventFormData(event.value)
})

function handleSubmit(formData: IEventFormData) {
  mutate(toUpdateEventRequest(formData))
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content form-content">
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

      <NCard v-else-if="event && initialData">
        <template #header>
          <div>
            <div class="form-header__title">Información del Evento</div>
            <p class="form-header__subtitle">Modifique los datos del evento según sea necesario.</p>
          </div>
        </template>

        <EventForm
          :initial-data="initialData"
          :existing-cover-url="event.coverImageUrl"
          :is-submitting="isUpdating"
          submit-label="Guardar Cambios"
          @submit="handleSubmit"
          @cancel="router.push({ name: EVENT_ROUTE_NAMES.DETAIL, params: { id: id } })"
        />
      </NCard>
    </div>
  </div>
</template>

<style scoped src="./event-form-view.css"></style>
