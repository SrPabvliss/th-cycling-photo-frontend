<script setup lang="ts">
import { NButton, NIcon, NInputNumber } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

import type { ICyclistDetail } from '../../../types/responses/cyclist-detail.response'
import { useCyclistFormState } from '../../../composables/use-cyclist-form-state'
import EquipmentColorRow from '../EquipmentColorRow/EquipmentColorRow.vue'

const props = defineProps<{
  photoId: string
  cyclist?: ICyclistDetail
}>()

const emit = defineEmits<{
  done: []
  cancel: []
}>()

const {
  isEditing,
  plateNumber,
  colors,
  isSubmitting,
  addColorRow,
  removeColorRow,
  updateColorRow,
  handleSubmit,
} = useCyclistFormState(props.photoId, props.cyclist)

async function onSubmit() {
  const success = await handleSubmit()
  if (success) emit('done')
}
</script>

<template>
  <div class="cyclist-form">
    <div>
      <p class="cyclist-form__section-label">Dorsal (opcional)</p>
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
      <p class="cyclist-form__section-label">Colores del equipamiento</p>
      <div class="cyclist-form__colors">
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

    <div class="cyclist-form__actions">
      <NButton size="small" @click="$emit('cancel')">Cancelar</NButton>
      <NButton type="primary" size="small" :loading="isSubmitting" @click="onSubmit">
        {{ isEditing ? 'Guardar' : 'Agregar' }}
      </NButton>
    </div>
  </div>
</template>

<style scoped src="./cyclist-form.css" />
