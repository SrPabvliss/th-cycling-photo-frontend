<script setup lang="ts">
import { NTooltip } from 'naive-ui'

import type { IPaletteColor } from '../../../constants/color-palette'

defineProps<{
  color: IPaletteColor
  selected: boolean
}>()

defineEmits<{
  select: [color: IPaletteColor]
}>()
</script>

<template>
  <NTooltip trigger="hover" :delay="300">
    <template #trigger>
      <div
        class="color-swatch"
        :class="{ 'color-swatch--selected': selected }"
        :style="{ backgroundColor: color.hex }"
        @click="$emit('select', color)"
      />
    </template>
    {{ color.name }}
  </NTooltip>
</template>

<style scoped src="./color-swatch.css" />
