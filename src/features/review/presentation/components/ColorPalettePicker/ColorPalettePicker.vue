<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NPopover } from 'naive-ui'
import { COLOR_PALETTE, COLOR_PALETTE_HEX, type ColorName } from '@/shared/constants/color-palette'

const props = defineProps<{
  value: ColorName | null
  allowNone?: boolean
  label?: string
  size?: 'small' | 'medium'
}>()

const emit = defineEmits<{
  'update:value': [value: ColorName | null]
}>()

const swatchColor = computed(() => (props.value ? COLOR_PALETTE_HEX[props.value] : 'transparent'))
const buttonText = computed(() => props.label ?? props.value ?? 'Seleccionar')
</script>

<template>
  <NPopover trigger="click" placement="bottom-start">
    <template #trigger>
      <NButton :size="size ?? 'small'">
        <span class="palette-trigger-swatch" :style="{ background: swatchColor }" />
        <span style="margin-left: 6px">{{ buttonText }}</span>
      </NButton>
    </template>
    <div class="palette-grid" data-test="palette-grid">
      <button
        v-for="color in COLOR_PALETTE"
        :key="color"
        type="button"
        class="palette-grid__swatch"
        :class="{ 'palette-grid__swatch--active': color === value }"
        :style="{ background: COLOR_PALETTE_HEX[color] }"
        :title="color"
        @click="emit('update:value', color)"
      />
      <button
        v-if="allowNone"
        type="button"
        class="palette-grid__swatch palette-grid__swatch--none"
        :class="{ 'palette-grid__swatch--active': value === null }"
        title="Ninguno"
        @click="emit('update:value', null)"
      />
    </div>
  </NPopover>
</template>

<style scoped src="./color-palette-picker.css" />
