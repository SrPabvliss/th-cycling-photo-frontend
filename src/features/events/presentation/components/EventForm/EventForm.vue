<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { NButton, NDatePicker, NFlex, NFormItem, NGrid, NGridItem, NIcon, NInput } from 'naive-ui'
import { ArrowForward } from '@vicons/ionicons5'

import { fieldInput, fieldStatus } from '@/shared/utils/form.utils'
import { EVENT_FORM_DEFAULTS, eventFormSchema } from '../../../constants/event-form.schema'
import type { IEventFormData } from '../../../types/event-form.types'

const props = defineProps<{
  isSubmitting: boolean
  initialData?: IEventFormData
  submitLabel?: string
}>()

const emit = defineEmits<{
  submit: [data: IEventFormData]
  cancel: []
}>()

const form = useForm({
  defaultValues: props.initialData ?? EVENT_FORM_DEFAULTS,
  onSubmit: async ({ value }) => {
    emit('submit', value)
  },
})
</script>

<template>
  <form
    @submit="
      (e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }
    "
  >
    <!-- Form Body -->
    <div style="padding: 32px">
      <NGrid :cols="2" :x-gap="32">
        <NGridItem>
          <NFlex vertical :size="8">
            <form.Field
              name="name"
              :validators="{
                onBlur: eventFormSchema.shape.name,
                onSubmit: eventFormSchema.shape.name,
              }"
            >
              <template v-slot="{ field }">
                <NFormItem label="Nombre del evento" required v-bind="fieldStatus(field)">
                  <NInput
                    placeholder="Ej. Copa Nacional Downhill 2026"
                    v-bind="fieldInput(field)"
                  />
                  <template #label-extra>
                    <span class="form-hint">Nombre oficial que aparecerá en los reportes.</span>
                  </template>
                </NFormItem>
              </template>
            </form.Field>

            <form.Field name="location">
              <template v-slot="{ field }">
                <NFormItem label="Ubicación">
                  <NInput
                    placeholder="Ej. Baños de Agua Santa, Tungurahua"
                    v-bind="fieldInput(field)"
                  />
                </NFormItem>
              </template>
            </form.Field>
          </NFlex>
        </NGridItem>

        <NGridItem>
          <NFlex vertical :size="8">
            <form.Field
              name="date"
              :validators="{
                onBlur: eventFormSchema.shape.date,
                onSubmit: eventFormSchema.shape.date,
              }"
            >
              <template v-slot="{ field }">
                <NFormItem label="Fecha" required v-bind="fieldStatus(field)">
                  <NDatePicker
                    type="date"
                    placeholder="Seleccionar fecha"
                    style="width: 100%"
                    v-bind="fieldInput(field)"
                  />
                </NFormItem>
              </template>
            </form.Field>
          </NFlex>
        </NGridItem>
      </NGrid>
    </div>

    <!-- Form Footer -->
    <NFlex justify="end" align="center" :size="12" class="form-footer">
      <NButton @click="emit('cancel')">Cancelar</NButton>
      <form.Subscribe>
        <template v-slot="{ canSubmit }">
          <NButton
            type="primary"
            attr-type="submit"
            :loading="props.isSubmitting"
            :disabled="!canSubmit"
          >
            {{ props.submitLabel ?? 'Crear Evento' }}
            <template #icon><NIcon :component="ArrowForward" /></template>
          </NButton>
        </template>
      </form.Subscribe>
    </NFlex>
  </form>
</template>

<style scoped src="./event-form.css"></style>
