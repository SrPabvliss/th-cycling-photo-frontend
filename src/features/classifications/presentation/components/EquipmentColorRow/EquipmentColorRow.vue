<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon, NSelect } from 'naive-ui'
import { CloseOutline } from '@vicons/ionicons5'

import type { IColorInput } from '../../../types/requests/create-cyclist.request'
import { EQUIPMENT_ITEM_LABELS } from '../../../types/equipment-item.types'
import type { IPaletteColor } from '../../../constants/color-palette'
import ColorPicker from '../ColorPicker/ColorPicker.vue'

const props = defineProps<{
  modelValue: IColorInput
}>()

const emit = defineEmits<{
  'update:modelValue': [value: IColorInput]
  remove: []
}>()

const itemTypeOptions = [
  { label: EQUIPMENT_ITEM_LABELS.helmet, value: 'helmet' },
  { label: EQUIPMENT_ITEM_LABELS.clothing, value: 'clothing' },
  { label: EQUIPMENT_ITEM_LABELS.bike, value: 'bike' },
]

const selectedColor = computed<IPaletteColor | null>(() => {
  if (!props.modelValue.colorName) return null
  return { name: props.modelValue.colorName, hex: props.modelValue.colorHex }
})

function handleItemTypeChange(value: string) {
  emit('update:modelValue', { ...props.modelValue, itemType: value })
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
        :value="modelValue.itemType"
        :options="itemTypeOptions"
        placeholder="Tipo"
        size="small"
        @update:value="handleItemTypeChange"
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
