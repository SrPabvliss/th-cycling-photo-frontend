<script setup lang="ts">
import { ref, watch } from 'vue'
import { NButton, NIcon, NInputNumber, useMessage } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

import type { IColorInput } from '../../../types/requests/create-cyclist.request'
import type { ILabelSet } from '../../../composables/use-label-conflict'
import { useBulkClassify } from '../../../composables/mutations/use-bulk-classify'
import EquipmentColorRow from '../EquipmentColorRow/EquipmentColorRow.vue'

const props = defineProps<{
  photoIds: string[]
  eventId: string
  initialLabels?: ILabelSet | null
}>()

const emit = defineEmits<{
  done: []
  cancel: []
}>()

const message = useMessage()
const bulkClassifyMutation = useBulkClassify()

const plateNumber = ref<number | null>(props.initialLabels?.plateNumber ?? null)
const colors = ref<IColorInput[]>(
  props.initialLabels?.colors.length
    ? [...props.initialLabels.colors]
    : [{ itemType: 'clothing', colorName: '', colorHex: '' }],
)

// Update when initialLabels change (inherited labels)
watch(
  () => props.initialLabels,
  (labels) => {
    if (!labels) return
    plateNumber.value = labels.plateNumber
    if (labels.colors.length) {
      colors.value = [...labels.colors]
    }
  },
)

function addColorRow() {
  colors.value.push({ itemType: 'clothing', colorName: '', colorHex: '' })
}

function removeColorRow(index: number) {
  colors.value.splice(index, 1)
}

function updateColorRow(index: number, value: IColorInput) {
  colors.value[index] = value
}

async function handleSubmit() {
  const validColors = colors.value.filter((c) => c.colorName && c.colorHex)

  if (validColors.length === 0) {
    message.warning('Agrega al menos un color')
    return
  }

  try {
    const result = await bulkClassifyMutation.mutateAsync({
      data: {
        photoIds: props.photoIds,
        colors: validColors,
        ...(plateNumber.value ? { plateNumber: plateNumber.value } : {}),
      },
      eventId: props.eventId,
    })
    message.success(`${result.classifiedCount} fotos clasificadas`)
    emit('done')
  } catch {
    message.error('Error al clasificar las fotos')
  }
}
</script>

<template>
  <div class="bulk-classify-form">
    <p class="bulk-classify-form__title">Clasificar {{ photoIds.length }} fotos</p>

    <div>
      <p class="bulk-classify-form__section-label">Dorsal (opcional)</p>
      <NInputNumber
        v-model:value="plateNumber"
        :min="1"
        :max="9999"
        placeholder="Ej: 42"
        size="small"
        clearable
        style="width: 120px"
      />
    </div>

    <div>
      <p class="bulk-classify-form__section-label">Colores del equipamiento</p>
      <div class="bulk-classify-form__colors">
        <EquipmentColorRow
          v-for="(color, index) in colors"
          :key="index"
          :model-value="color"
          @update:model-value="(v) => updateColorRow(index, v)"
          @remove="removeColorRow(index)"
        />
      </div>
      <NButton size="tiny" quaternary style="margin-top: 4px" @click="addColorRow">
        <template #icon><NIcon :component="AddOutline" /></template>
        Agregar color
      </NButton>
    </div>

    <div class="bulk-classify-form__actions">
      <NButton size="small" @click="$emit('cancel')">Cancelar</NButton>
      <NButton
        type="primary"
        size="small"
        :loading="bulkClassifyMutation.isPending.value"
        @click="handleSubmit"
      >
        Clasificar todas ({{ photoIds.length }})
      </NButton>
    </div>
  </div>
</template>

<style scoped src="./bulk-classify-form.css" />
