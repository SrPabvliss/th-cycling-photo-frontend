<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NResult } from 'naive-ui'

import PageHeader from '@/shared/components/PageHeader.vue'
import { useUploadAssetsBatch } from '@/features/event-assets/composables/mutations/use-upload-assets-batch'
import { useAssignPhotoCategoriesBatch } from '@/features/photo-categories/composables/mutations/use-assign-photo-categories-batch'
import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { useCreateEvent } from '../../composables/mutations/use-create-event'
import { EVENT_ROUTE_NAMES } from '../../routes'
import { toCreateEventRequest } from '../../mappers/event-form.mapper'
import type { IEventFormData } from '../../types/event-form.types'
import type { IEventFormExtra } from '../components/EventForm/EventForm.vue'
import type { IEventConfigurationSelectionRequest } from '../../types/requests/event-configuration.request'
import EventForm from '../components/EventForm/EventForm.vue'
import EventConfigurationStep from '../components/EventConfigurationStep.vue'

const router = useRouter()
const { has } = usePermissions()
const canCreateEvent = computed(() => has(PERMISSIONS.EVENT_CREATE))

const isSubmitting = ref(false)
const currentStep = ref<'configuration' | 'details'>('configuration')
const configuration = ref<IEventConfigurationSelectionRequest>({})
const isConfigurationReady = ref(false)

const { mutateAsync: createEvent } = useCreateEvent()
const { mutateAsync: uploadAssetsBatch } = useUploadAssetsBatch()
const { mutateAsync: assignCategoriesBatch } = useAssignPhotoCategoriesBatch()

async function handleSubmit(formData: IEventFormData, extra: IEventFormExtra) {
  isSubmitting.value = true
  try {
    const { id } = await createEvent(toCreateEventRequest(formData, configuration.value))

    const promises: Promise<unknown>[] = []

    if (extra.assetFiles && extra.assetFiles.size > 0) {
      promises.push(uploadAssetsBatch({ eventId: id, assetFiles: extra.assetFiles }))
    }

    if (extra.categoryIds && extra.categoryIds.length > 0) {
      promises.push(assignCategoriesBatch({ eventId: id, categoryIds: extra.categoryIds }))
    }

    await Promise.all(promises)

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

        <div v-if="!canCreateEvent" class="error-container">
          <NResult
            status="403"
            title="Sin permiso"
            description="No tienes permiso para crear eventos."
          />
        </div>

        <template v-else-if="currentStep === 'configuration'">
          <EventConfigurationStep
            @update:configuration="configuration = $event"
            @update:ready="isConfigurationReady = $event"
          />
          <div class="event-form-container__footer">
            <NButton
              type="primary"
              :disabled="!isConfigurationReady"
              @click="currentStep = 'details'"
            >
              Continuar
            </NButton>
          </div>
        </template>

        <EventForm
          v-else
          :is-submitting="isSubmitting"
          @submit="handleSubmit"
          @cancel="router.push({ name: EVENT_ROUTE_NAMES.LIST })"
        />
      </div>
    </div>
  </div>
</template>

<style scoped src="./event-form-view.css"></style>
