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
  NSwitch,
} from 'naive-ui'
import { ArrowForward, StarOutline } from '@vicons/ionicons5'

import { fieldInput, fieldStatus } from '@/shared/utils/form.utils'
import { useProvincesQuery } from '@/features/locations/composables/queries/use-provinces'
import { useCantonsQuery } from '@/features/locations/composables/queries/use-cantons'
import { useLocalAssetPreviews } from '@/features/event-assets/composables/use-local-asset-previews'
import type { EventAssetType } from '@/features/event-assets/types/asset-type'
import type { IEventAsset } from '@/features/event-assets/types/responses/event-asset.response'
import AssetUploadZone from '@/features/event-assets/presentation/components/AssetUploadZone/AssetUploadZone.vue'
import EventCategoryPicker from '@/features/photo-categories/presentation/components/EventCategoryPicker/EventCategoryPicker.vue'
import { useCreatePhotoCategory } from '@/features/photo-categories/composables/mutations/use-create-photo-category'
import { EVENT_FORM_DEFAULTS, eventFormSchema } from '../../../constants/event-form.schema'
import type { IEventFormData } from '../../../types/event-form.types'

export interface IEventFormExtra {
  assetFiles?: Map<EventAssetType, File>
  assetRemovals?: EventAssetType[]
  categoryIds?: number[]
  isFeatured?: boolean
}

const props = defineProps<{
  isSubmitting: boolean
  initialData?: IEventFormData
  submitLabel?: string
  hideAssetUpload?: boolean
  existingAssets?: IEventAsset[]
  initialFeatured?: boolean
  initialCategoryIds?: number[]
}>()

const emit = defineEmits<{
  submit: [data: IEventFormData, extra: IEventFormExtra]
  cancel: []
}>()

const form = useForm({
  defaultValues: props.initialData ?? EVENT_FORM_DEFAULTS,
  onSubmit: async ({ value }) => {
    const removals = assetPreviews.getPendingRemovals()
    emit('submit', value, {
      assetFiles: assetPreviews.getPendingFiles(),
      assetRemovals: removals.length > 0 ? removals : undefined,
      categoryIds: selectedCategoryIds.value.length > 0 ? selectedCategoryIds.value : undefined,
      isFeatured: isFeatured.value || undefined,
    })
  },
})

const assetPreviews = useLocalAssetPreviews(() => props.existingAssets)
const selectedCategoryIds = ref<number[]>(props.initialCategoryIds ?? [])
const isFeatured = ref(props.initialFeatured ?? false)

const { mutateAsync: createCategory } = useCreatePhotoCategory()

async function handleCreateNewCategory(name: string) {
  const { data } = await createCategory(name)
  selectedCategoryIds.value = [...selectedCategoryIds.value, data.id]
}

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

      <div class="form-divider" />

      <NFlex vertical :size="16">
        <EventCategoryPicker
          :selected-ids="selectedCategoryIds"
          @update:selected-ids="selectedCategoryIds = $event"
          @create-new="handleCreateNewCategory"
        />

        <NFlex align="center" justify="space-between" class="featured-toggle">
          <div>
            <NFlex align="center" :size="6">
              <NIcon :component="StarOutline" :size="16" color="var(--tt-neutral-mid)" />
              <span class="featured-toggle__label">Marcar como destacado</span>
            </NFlex>
            <p class="featured-toggle__hint">
              Se mostrará como evento principal en la galería. Solo uno puede estar destacado.
            </p>
          </div>
          <NSwitch v-model:value="isFeatured" />
        </NFlex>
      </NFlex>
    </div>

    <!-- Right panel: assets -->
    <div v-if="!hideAssetUpload" class="event-form__assets">
      <div class="assets-grid">
        <AssetUploadZone
          asset-type="cover_image"
          :current-url="assetPreviews.getAssetUrl('cover_image')"
          @upload="(file) => assetPreviews.addFile('cover_image', file)"
          @remove="assetPreviews.removeFile('cover_image')"
        />

        <AssetUploadZone
          asset-type="hero_image"
          :current-url="assetPreviews.getAssetUrl('hero_image')"
          @upload="(file) => assetPreviews.addFile('hero_image', file)"
          @remove="assetPreviews.removeFile('hero_image')"
        />

        <div class="assets-pair">
          <AssetUploadZone
            asset-type="event_logo"
            :current-url="assetPreviews.getAssetUrl('event_logo')"
            @upload="(file) => assetPreviews.addFile('event_logo', file)"
            @remove="assetPreviews.removeFile('event_logo')"
          />
          <AssetUploadZone
            asset-type="poster"
            :current-url="assetPreviews.getAssetUrl('poster')"
            @upload="(file) => assetPreviews.addFile('poster', file)"
            @remove="assetPreviews.removeFile('poster')"
          />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="event-form__footer">
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
