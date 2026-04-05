<script setup lang="ts">
import { NButton, NIcon, NInput } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

import type { IParticipantDetail } from '../../../types/responses/cyclist-detail.response'
import { useParticipantFormState } from '../../../composables/use-cyclist-form-state'
import { useGearTypesQuery } from '../../../composables/queries/use-gear-types'
import EquipmentColorRow from '../EquipmentColorRow/EquipmentColorRow.vue'

const props = defineProps<{
  photoId: string
  cyclist?: IParticipantDetail
}>()

const emit = defineEmits<{
  done: []
  cancel: []
}>()

const { data: gearTypes } = useGearTypesQuery(1) // Default: Downhill (eventTypeId=1)

const {
  isEditing,
  identifier,
  gearColors,
  isSubmitting,
  addColorRow,
  removeColorRow,
  updateColorRow,
  handleSubmit,
} = useParticipantFormState(props.photoId, props.cyclist)

async function onSubmit() {
  const success = await handleSubmit()
  if (success) emit('done')
}
</script>

<template>
  <div class="cyclist-form">
    <div>
      <p class="cyclist-form__section-label">Dorsal (opcional)</p>
      <NInput
        v-model:value="identifier"
        placeholder="Ej: 42"
        size="small"
        clearable
        style="width: 120px"
      />
    </div>

    <div>
      <p class="cyclist-form__section-label">Colores del equipamiento</p>
      <div class="cyclist-form__colors">
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

    <div class="cyclist-form__actions">
      <NButton size="small" @click="$emit('cancel')">Cancelar</NButton>
      <NButton type="primary" size="small" :loading="isSubmitting" @click="onSubmit">
        {{ isEditing ? 'Guardar' : 'Agregar' }}
      </NButton>
    </div>
  </div>
</template>

<style scoped src="./cyclist-form.css" />
