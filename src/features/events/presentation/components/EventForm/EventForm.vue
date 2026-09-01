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
import { ArrowForward } from '@vicons/ionicons5'

import { fieldInput, fieldStatus } from '@/shared/utils/form.utils'
import { useProvincesQuery } from '@/features/locations/composables/queries/use-provinces'
import { useCantonsQuery } from '@/features/locations/composables/queries/use-cantons'
import { useEventTypesQuery } from '@/features/event-types/composables/queries/use-event-types'
import { useLocalAssetPreviews } from '@/features/event-assets/composables/use-local-asset-previews'
import type { IEventAsset } from '@/features/event-assets/types/responses/event-asset.response'
import AssetUploadZone from '@/features/event-assets/presentation/components/AssetUploadZone/AssetUploadZone.vue'
import type { IFocalPoint } from '@/features/event-assets/composables/use-local-asset-previews'
import EventCategoryPicker from '@/features/photo-categories/presentation/components/EventCategoryPicker/EventCategoryPicker.vue'
import { useCreatePhotoCategory } from '@/features/photo-categories/composables/mutations/use-create-photo-category'
import { EVENT_FORM_DEFAULTS, eventFormSchema } from '../../../constants/event-form.schema'
import type { IEventFormData, IEventFormExtra } from '../../../types/event-form.types'

const props = defineProps<{
  isSubmitting: boolean
  initialData?: IEventFormData
  submitLabel?: string
  hideAssetUpload?: boolean
  hideFooter?: boolean
  existingAssets?: IEventAsset[]
  initialCategoryIds?: number[]
}>()

const emit = defineEmits<{
  submit: [data: IEventFormData, extra: IEventFormExtra]
  cancel: []
}>()

const form = useForm({
  defaultValues: props.initialData ?? EVENT_FORM_DEFAULTS,
  onSubmit: async ({ value }) => {
    const removals = assetPreviews.getPendingRemovals() as 'cover_image'[]
    const files = assetPreviews.getPendingFiles() as Map<'cover_image', File> | undefined
    emit('submit', value, {
      assetFiles: files,
      assetFocalPoints: assetPreviews.getPendingFocalPoints() as
        | Map<'cover_image', IFocalPoint>
        | undefined,
      assetRemovals: removals.length > 0 ? removals : undefined,
      categoryIds: selectedCategoryIds.value.length > 0 ? selectedCategoryIds.value : undefined,
    })
  },
})

defineExpose({
  submit: () => form.handleSubmit(),
  canSubmit: computed(() => form.state.canSubmit),
})

const assetPreviews = useLocalAssetPreviews(() => props.existingAssets)
const selectedCategoryIds = ref<number[]>(props.initialCategoryIds ?? [])

const { mutateAsync: createCategory } = useCreatePhotoCategory()

async function handleCreateNewCategory(name: string) {
  const { data } = await createCategory(name)
  selectedCategoryIds.value = [...selectedCategoryIds.value, data.id]
}

const selectedProvinceId = ref<number | null>(props.initialData?.provinceId ?? null)

const { data: provinces, isPending: isLoadingProvinces } = useProvincesQuery()
const { data: cantons, isFetching: isLoadingCantons } = useCantonsQuery(selectedProvinceId)
const { data: eventTypes, isPending: isLoadingEventTypes } = useEventTypesQuery()

const provinceOptions = computed(
  () => provinces.value?.map((p) => ({ label: p.name, value: p.id })) ?? [],
)

const cantonOptions = computed(
  () => cantons.value?.map((c) => ({ label: c.name, value: c.id })) ?? [],
)

const eventTypeOptions = computed(
  () => eventTypes.value?.map((t) => ({ label: t.name, value: t.id })) ?? [],
)
</script>

<template>
  <form
    class="event-form"
    @submit="
      (e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }
    "
  >
    <!-- Left panel: form fields -->
    <div class="event-form__fields">
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
          name="eventTypeId"
          :validators="{
            onChange: eventFormSchema.shape.eventTypeId,
            onSubmit: eventFormSchema.shape.eventTypeId,
          }"
        >
          <template v-slot="{ field }">
            <NFormItem label="Tipo de evento" required v-bind="fieldStatus(field)">
              <NSelect
                placeholder="Selecciona tipo de evento"
                :options="eventTypeOptions"
                :loading="isLoadingEventTypes"
                :value="field.state.value"
                filterable
                @update:value="(val: number) => field.handleChange(val)"
                @blur="field.handleBlur"
              />
            </NFormItem>
          </template>
        </form.Field>

        <form.Field name="startDate">
          <template v-slot="{ field: startField }">
            <form.Field name="endDate">
              <template v-slot="{ field: endField }">
                <NFormItem
                  label="Fechas del evento"
                  required
                  :validation-status="
                    (startField.state.meta.isTouched && !startField.state.meta.isValid) ||
                    (endField.state.meta.isTouched && !endField.state.meta.isValid)
                      ? 'error'
                      : undefined
                  "
                >
                  <NDatePicker
                    type="daterange"
                    clearable
                    style="width: 100%"
                    format="dd-MMM-yyyy"
                    start-placeholder="Fecha inicio"
                    end-placeholder="Fecha fin"
                    :value="
                      startField.state.value !== null && endField.state.value !== null
                        ? [startField.state.value, endField.state.value]
                        : null
                    "
                    @update:value="
                      (value: [number, number] | null) => {
                        form.setFieldValue('startDate', value?.[0] ?? null)
                        form.setFieldValue('endDate', value?.[1] ?? null)
                      }
                    "
                    @blur="
                      () => {
                        startField.handleBlur()
                        endField.handleBlur()
                      }
                    "
                  />
                </NFormItem>
              </template>
            </form.Field>
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
      </NFlex>

      <div class="form-divider" />

      <NFlex vertical :size="16">
        <EventCategoryPicker
          :selected-ids="selectedCategoryIds"
          @update:selected-ids="selectedCategoryIds = $event"
          @create-new="handleCreateNewCategory"
        />
      </NFlex>
    </div>

    <!-- Right panel: assets -->
    <div v-if="!hideAssetUpload" class="event-form__assets">
      <div class="assets-grid">
        <AssetUploadZone
          asset-type="cover_image"
          :current-url="assetPreviews.getAssetUrl('cover_image')"
          :focal-x="assetPreviews.getFocalPoint('cover_image').focalX"
          :focal-y="assetPreviews.getFocalPoint('cover_image').focalY"
          @upload="(file) => assetPreviews.addFile('cover_image', file)"
          @remove="assetPreviews.removeFile('cover_image')"
          @update:focal-x="
            (value) =>
              assetPreviews.setFocalPoint('cover_image', {
                ...assetPreviews.getFocalPoint('cover_image'),
                focalX: value,
              })
          "
          @update:focal-y="
            (value) =>
              assetPreviews.setFocalPoint('cover_image', {
                ...assetPreviews.getFocalPoint('cover_image'),
                focalY: value,
              })
          "
        />
      </div>
    </div>

    <!-- Footer -->
    <div v-if="!props.hideFooter" class="event-form__footer">
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
    </div>
  </form>
</template>

<style scoped src="./event-form.css"></style>
