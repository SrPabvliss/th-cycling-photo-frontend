<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon, NSelect } from 'naive-ui'
import { CloseOutline } from '@vicons/ionicons5'

import type { IGearColorInput } from '../../../types/requests/create-cyclist.request'
import type { IGearType } from '../../../types/equipment-item.types'
import { GEAR_TYPE_LABELS } from '../../../types/equipment-item.types'
import type { IPaletteColor } from '../../../constants/color-palette'
import ColorPicker from '../ColorPicker/ColorPicker.vue'

const props = defineProps<{
  modelValue: IGearColorInput
  gearTypes: IGearType[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: IGearColorInput]
  remove: []
}>()

const gearTypeOptions = computed(() =>
  props.gearTypes.map((gt) => ({
    label: GEAR_TYPE_LABELS[gt.name] ?? gt.name,
    value: gt.id,
  })),
)

const selectedColor = computed<IPaletteColor | null>(() => {
  if (!props.modelValue.colorName) return null
  return { name: props.modelValue.colorName, hex: props.modelValue.colorHex }
})

function handleGearTypeChange(value: number | null) {
  emit('update:modelValue', {
    ...props.modelValue,
    gearTypeId: value ?? props.gearTypes[0]?.id ?? 1,
  })
}

function handleColorChange(color: IPaletteColor) {
  emit('update:modelValue', {
    ...props.modelValue,
    colorName: color.name,
    colorHex: color.hex,
  })
}
</script>

<template>
  <div class="equipment-color-row">
    <div class="equipment-color-row__header">
      <NSelect
        class="equipment-color-row__select"
        :value="modelValue.gearTypeId"
        :options="gearTypeOptions"
        placeholder="Tipo"
        size="small"
        @update:value="handleGearTypeChange"
      />
      <div v-if="modelValue.colorName" class="equipment-color-row__preview">
        <div
          class="equipment-color-row__preview-dot"
          :style="{ backgroundColor: modelValue.colorHex }"
        />
        {{ modelValue.colorName }}
      </div>
      <NButton quaternary circle size="tiny" @click="$emit('remove')">
        <template #icon><NIcon :component="CloseOutline" /></template>
      </NButton>
    </div>
    <ColorPicker :model-value="selectedColor" @update:model-value="handleColorChange" />
  </div>
</template>

<style scoped src="./equipment-color-row.css" />
