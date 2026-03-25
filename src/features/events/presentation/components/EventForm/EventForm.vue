<script setup lang="ts">
import { computed, ref } from 'vue'
import { useForm } from '@tanstack/vue-form'
import {
  NButton,
  NDatePicker,
  NFlex,
  NFormItem,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NSelect,
} from 'naive-ui'
import { ArrowForward, CameraOutline, CloseCircleOutline, ImageOutline } from '@vicons/ionicons5'

import { fieldInput, fieldStatus } from '@/shared/utils/form.utils'
import { useProvincesQuery } from '@/features/locations/composables/queries/use-provinces'
import { useCantonsQuery } from '@/features/locations/composables/queries/use-cantons'
import { EVENT_FORM_DEFAULTS, eventFormSchema } from '../../../constants/event-form.schema'
import type { IEventFormData } from '../../../types/event-form.types'

const ACCEPTED_COVER_TYPES = 'image/jpeg,image/png,image/webp'

const props = defineProps<{
  isSubmitting: boolean
  initialData?: IEventFormData
  submitLabel?: string
  hideCoverUpload?: boolean
  existingCoverUrl?: string | null
}>()

const emit = defineEmits<{
  submit: [data: IEventFormData, coverFile?: File]
  cancel: []
}>()

const form = useForm({
  defaultValues: props.initialData ?? EVENT_FORM_DEFAULTS,
  onSubmit: async ({ value }) => {
    emit('submit', value, coverFile.value ?? undefined)
  },
})

// --- Cover image ---

const coverFile = ref<File | null>(null)
const coverPreview = ref<string | null>(props.existingCoverUrl ?? null)
const coverInput = ref<HTMLInputElement | null>(null)

function triggerCoverInput() {
  coverInput.value?.click()
}

function handleCoverChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  coverFile.value = file
  coverPreview.value = URL.createObjectURL(file)
  if (coverInput.value) coverInput.value.value = ''
}

function removeCover() {
  if (coverPreview.value) URL.revokeObjectURL(coverPreview.value)
  coverFile.value = null
  coverPreview.value = null
}

// --- Location cascading ---

const selectedProvinceId = ref<number | null>(props.initialData?.provinceId ?? null)

const { data: provinces, isPending: isLoadingProvinces } = useProvincesQuery()
const { data: cantons, isFetching: isLoadingCantons } = useCantonsQuery(selectedProvinceId)

const provinceOptions = computed(
  () => provinces.value?.map((p) => ({ label: p.name, value: p.id })) ?? [],
)

const cantonOptions = computed(
  () => cantons.value?.map((c) => ({ label: c.name, value: c.id })) ?? [],
)
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
      <div class="form-layout">
        <!-- Left column: form fields -->
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
                <NInput placeholder="Ej. Copa Nacional Downhill 2026" v-bind="fieldInput(field)" />
                <template #label-extra>
                  <span class="form-hint">Nombre oficial que aparecerá en los reportes.</span>
                </template>
              </NFormItem>
            </template>
          </form.Field>

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

          <NGrid :cols="2" :x-gap="16">
            <NGridItem>
              <form.Field name="provinceId">
                <template v-slot="{ field }">
                  <NFormItem label="Provincia">
                    <NSelect
                      placeholder="Seleccionar provincia"
                      :options="provinceOptions"
                      :loading="isLoadingProvinces"
                      :value="field.state.value"
                      filterable
                      clearable
                      @update:value="
                        (val: number | null) => {
                          field.handleChange(val)
                          selectedProvinceId = val
                          form.setFieldValue('cantonId', null)
                        }
                      "
                      @blur="field.handleBlur"
                    />
                  </NFormItem>
                </template>
              </form.Field>
            </NGridItem>
            <NGridItem>
              <form.Field name="cantonId">
                <template v-slot="{ field }">
                  <NFormItem label="Cantón">
                    <NSelect
                      placeholder="Seleccionar cantón"
                      :options="cantonOptions"
                      :loading="isLoadingCantons"
                      :disabled="!selectedProvinceId"
                      filterable
                      clearable
                      v-bind="fieldInput(field)"
                    />
                  </NFormItem>
                </template>
              </form.Field>
            </NGridItem>
          </NGrid>

          <form.Field name="description">
            <template v-slot="{ field }">
              <NFormItem label="Descripción">
                <NInput
                  type="textarea"
                  placeholder="Descripción opcional del evento"
                  :rows="3"
                  :maxlength="1000"
                  show-count
                  v-bind="fieldInput(field)"
                />
              </NFormItem>
            </template>
          </form.Field>
        </NFlex>

        <!-- Right column: cover image -->
        <NFlex v-if="!hideCoverUpload" vertical :size="16">
          <NFormItem label="Imagen de portada">
            <template #label-extra>
              <span class="form-hint">
                Si no se selecciona, se asignará automáticamente la primera foto subida.
              </span>
            </template>
            <div v-if="coverPreview" class="cover-preview">
              <img :src="coverPreview" alt="Preview" class="cover-preview__image" />
              <NButton circle size="tiny" class="cover-preview__remove" @click="removeCover">
                <template #icon><NIcon :component="CloseCircleOutline" /></template>
              </NButton>
            </div>
            <div v-else class="cover-upload-area" @click="triggerCoverInput">
              <NFlex vertical align="center" :size="4">
                <NIcon :component="ImageOutline" :size="28" color="var(--tt-neutral-light)" />
                <span class="cover-upload-area__text">
                  <NIcon :component="CameraOutline" :size="14" />
                  Seleccionar imagen
                </span>
              </NFlex>
            </div>
            <input
              ref="coverInput"
              type="file"
              :accept="ACCEPTED_COVER_TYPES"
              style="display: none"
              @change="handleCoverChange"
            />
          </NFormItem>

          <div class="cover-requirements">
            <p class="cover-requirements__title">Requisitos de imagen</p>
            <ul class="cover-requirements__list">
              <li>Mínimo 1280 x 720px</li>
              <li>Relación 16:9 recomendada</li>
              <li>Tamaño máximo: 5MB</li>
              <li>Formatos: JPG, PNG, WEBP</li>
            </ul>
          </div>
        </NFlex>
      </div>
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
