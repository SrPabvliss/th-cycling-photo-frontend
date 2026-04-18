<script setup lang="ts">
import { ref, watch } from 'vue'
import { NButton, NIcon, NInput, useMessage } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

import type { IGearColorInput } from '../../../types/requests/create-cyclist.request'
import type { ILabelSet } from '../../../composables/use-label-conflict'
import { useBulkClassify } from '../../../composables/mutations/use-bulk-classify'
import { useGearTypesQuery } from '../../../composables/queries/use-gear-types'
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
const { data: gearTypes } = useGearTypesQuery(1) // Default: Downhill

const identifier = ref<string | null>(props.initialLabels?.identifier ?? null)
const gearColors = ref<IGearColorInput[]>(
  props.initialLabels?.gearColors.length
    ? [...props.initialLabels.gearColors]
    : [{ gearTypeId: 1, colorName: '', colorHex: '' }],
)

// Update when initialLabels change (inherited labels)
watch(
  () => props.initialLabels,
  (labels) => {
    if (!labels) return
    identifier.value = labels.identifier
    if (labels.gearColors.length) {
      gearColors.value = [...labels.gearColors]
    }
  },
)

function addColorRow() {
  gearColors.value.push({ gearTypeId: 1, colorName: '', colorHex: '' })
}

function removeColorRow(index: number) {
  gearColors.value.splice(index, 1)
}

function updateColorRow(index: number, value: IGearColorInput) {
  gearColors.value[index] = value
}

async function handleSubmit() {
  const validColors = gearColors.value.filter((c) => c.colorName && c.colorHex)

  if (validColors.length === 0) {
    message.warning('Agrega al menos un color')
    return
  }

  try {
    const result = await bulkClassifyMutation.mutateAsync({
      data: {
        photoIds: props.photoIds,
        colors: validColors,
        ...(identifier.value ? { identifier: identifier.value } : {}),
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
      <NInput
        v-model:value="identifier"
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
          v-for="(color, index) in gearColors"
          :key="index"
          :model-value="color"
          :gear-types="gearTypes ?? []"
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
