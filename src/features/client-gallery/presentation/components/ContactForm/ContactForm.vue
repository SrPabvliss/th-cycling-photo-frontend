<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { NButton, NFormItem, NIcon, NInput, NSelect } from 'naive-ui'
import { SendOutline, ChevronBack, CheckmarkCircleOutline } from '@vicons/ionicons5'

import { fieldInput } from '@/shared/utils/form.utils'
import { useParticipantCategoriesQuery } from '@/features/participant-categories/composables/queries/use-participant-categories'
import {
  CONTACT_FORM_DEFAULTS,
  type IContactFormData,
} from '../../../constants/contact-form.schema'
import type { IPreviewPhoto } from '../../../types/responses/preview-data.response'
import OrderSummary from '../OrderSummary/OrderSummary.vue'

defineProps<{
  token: string
  eventName: string
  eventDate: Date
  selectedPhotos: IPreviewPhoto[]
  photoCount: number
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  submit: [data: IContactFormData]
  back: []
}>()

const { data: categories } = useParticipantCategoriesQuery(1) // Default: Downhill

const categoryOptions = computed(
  () => categories.value?.map((c) => ({ label: c.name, value: c.name })) ?? [],
)

const form = useForm({
  defaultValues: CONTACT_FORM_DEFAULTS,
  onSubmit: async ({ value }) => {
    emit('submit', value)
  },
})
</script>

<template>
  <div class="cf">
    <!-- Back bar -->
    <div class="cf-back-bar">
      <a class="cf-back-link" @click="emit('back')">
        <NIcon :component="ChevronBack" :size="14" />
        Volver a las fotos
      </a>
      <span class="cf-breadcrumb-sep">/</span>
      <span class="cf-breadcrumb-cur">Confirmar pedido</span>
    </div>

    <div class="cf-grid">
      <!-- LEFT: Summary -->
      <OrderSummary
        :event-name="eventName"
        :event-date="eventDate"
        :selected-photos="selectedPhotos"
        :photo-count="photoCount"
      />

      <!-- RIGHT: Form -->
      <div class="cf-form-col">
        <div class="cf-form-heading">
          <h1 class="cf-form-title">Confirmar pedido</h1>
          <p class="cf-form-subtitle">
            Completa los datos de tu pedido. Te contactaremos para coordinar el pago y la entrega.
          </p>
        </div>

        <form
          class="cf-form-grid"
          @submit="
            (e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }
          "
        >
          <div class="cf-field">
            <form.Field name="snapCategoryName">
              <template v-slot="{ field }">
                <NFormItem label="Categoría">
                  <NSelect
                    :options="categoryOptions"
                    placeholder="Seleccionar categoría"
                    filterable
                    :value="field.state.value || null"
                    @update:value="field.handleChange"
                    @blur="field.handleBlur"
                  />
                </NFormItem>
              </template>
            </form.Field>
          </div>

          <div class="cf-field">
            <form.Field name="bibNumber">
              <template v-slot="{ field }">
                <NFormItem label="Número de dorsal">
                  <NInput placeholder="Ej. 127" v-bind="fieldInput(field)" />
                </NFormItem>
              </template>
            </form.Field>
          </div>

          <div class="cf-field cf-field--full">
            <form.Field name="notes">
              <template v-slot="{ field }">
                <NFormItem label="Observaciones (opcional)">
                  <NInput
                    type="textarea"
                    placeholder="¿Algún comentario adicional sobre tu pedido?"
                    :rows="3"
                    :maxlength="500"
                    show-count
                    v-bind="fieldInput(field)"
                  />
                </NFormItem>
              </template>
            </form.Field>
          </div>

          <div class="cf-field cf-field--full cf-cta">
            <form.Subscribe>
              <template v-slot="{ canSubmit }">
                <NButton
                  type="primary"
                  size="large"
                  block
                  :loading="isSubmitting"
                  :disabled="!canSubmit"
                  attr-type="submit"
                >
                  <template #icon><NIcon :component="SendOutline" /></template>
                  Confirmar mi pedido
                </NButton>
              </template>
            </form.Subscribe>
            <p class="cf-cta-note">
              <NIcon :component="CheckmarkCircleOutline" :size="14" color="#18a058" />
              Te contactaremos por WhatsApp para coordinar el pago
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped src="./contact-form.css" />
