<script setup lang="ts">
import { COLOR_PALETTE, type IPaletteColor } from '../../../constants/color-palette'
import ColorSwatch from '../ColorSwatch/ColorSwatch.vue'

const props = defineProps<{
  modelValue: IPaletteColor | null
}>()

const emit = defineEmits<{
  'update:modelValue': [color: IPaletteColor]
}>()

function handleSelect(color: IPaletteColor) {
  emit('update:modelValue', color)
}

function isSelected(color: IPaletteColor) {
  return props.modelValue?.hex === color.hex
}
</script>

<template>
  <div class="color-picker">
    <ColorSwatch
      v-for="color in COLOR_PALETTE"
      :key="color.hex"
      :color="color"
      :selected="isSelected(color)"
      @select="handleSelect"
    />
  </div>
</template>

<style scoped src="./color-picker.css" />
