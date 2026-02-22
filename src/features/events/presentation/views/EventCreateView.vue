<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NCard, NTag } from 'naive-ui'

import AppTopBar from '@/core/layout/AppTopBar.vue'
import { useCreateEvent } from '../../composables/mutations/use-create-event'
import { createBreadcrumbs } from '../../constants/event-breadcrumbs'
import { EVENT_ROUTE_NAMES } from '../../routes'
import { toCreateEventRequest } from '../../mappers/event-form.mapper'
import type { IEventFormData } from '../../types/event-form.types'
import EventForm from '../components/EventForm/EventForm.vue'

const router = useRouter()
const { mutate, isPending } = useCreateEvent()

const breadcrumbs = createBreadcrumbs()

function handleSubmit(formData: IEventFormData) {
  mutate(toCreateEventRequest(formData))
}
</script>

<template>
  <div class="page-view">
    <AppTopBar title="Crear Nuevo Evento" :breadcrumbs="breadcrumbs">
      <template #badge>
        <NTag size="small" round>Borrador</NTag>
      </template>
    </AppTopBar>

    <div class="page-view__content form-content">
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
          :is-submitting="isPending"
          @submit="handleSubmit"
          @cancel="router.push({ name: EVENT_ROUTE_NAMES.LIST })"
        />
      </NCard>
    </div>
  </div>
</template>

<style scoped src="./event-form-view.css"></style>
