<script setup lang="ts">
import { NButton, NFlex, NIcon, NInput, NTooltip } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'

import {
  COLOR_PALETTE,
  COLOR_PALETTE_HEX,
  COLOR_PALETTE_LABELS,
  type ColorName,
} from '@/shared/constants/color-palette'
import type { IPhotoCategory } from '@/features/photo-categories/types/responses/photo-category.response'
import type { PhotoStatus } from '@/shared/types/photo-enums'

const PALETTE_OPTIONS: Array<{ name: ColorName; hex: string; label: string }> = COLOR_PALETTE.map(
  (name) => ({
    name,
    hex: COLOR_PALETTE_HEX[name],
    label: COLOR_PALETTE_LABELS[name],
  }),
)

const STATUS_OPTIONS: Array<{ label: string; status: PhotoStatus | null }> = [
  { label: 'Todas', status: null },
  { label: 'Procesadas', status: 'processed' },
  { label: 'Pendientes', status: 'pending' },
  { label: 'Procesando', status: 'processing' },
  { label: 'Revisadas', status: 'reviewed' },
  { label: 'Fallidas', status: 'failed' },
]

defineProps<{
  activeStatus: PhotoStatus | null
  plateNumber: string
  helmetColors: string[]
  clothingColors: string[]
  bikeColors: string[]
  photoCategoryId: number | null
  categories: IPhotoCategory[]
  hasActiveFilters: boolean
}>()

const emit = defineEmits<{
  'update:plateNumber': [value: string]
  'update:activeStatus': [value: PhotoStatus | null]
  'update:photoCategoryId': [value: number | null]
  'update:helmetColors': [value: string[]]
  'update:clothingColors': [value: string[]]
  'update:bikeColors': [value: string[]]
  clearFilters: []
}>()

function toggleColor(list: string[], color: string): string[] {
  return list.includes(color) ? list.filter((c) => c !== color) : [...list, color]
}
</script>

<template>
  <aside class="filter-sidebar">
    <div class="filter-section">
      <p class="filter-section__title">Buscar dorsal</p>
      <NInput
        :value="plateNumber"
        placeholder="Ej. 127"
        clearable
        @update:value="emit('update:plateNumber', $event)"
      >
        <template #prefix>
          <NIcon :component="SearchOutline" :size="16" />
        </template>
      </NInput>
    </div>

    <div class="filter-section">
      <p class="filter-section__title">Estado</p>
      <NFlex vertical :size="4">
        <button
          v-for="opt in STATUS_OPTIONS"
          :key="opt.label"
          :class="['status-option', { 'status-option--active': activeStatus === opt.status }]"
          @click="emit('update:activeStatus', opt.status)"
        >
          <span class="status-option__label">{{ opt.label }}</span>
        </button>
      </NFlex>
    </div>

    <div v-if="categories.length > 0" class="filter-section">
      <p class="filter-section__title">Categoría</p>
      <NFlex vertical :size="4">
        <button
          :class="['status-option', { 'status-option--active': photoCategoryId === null }]"
          @click="emit('update:photoCategoryId', null)"
        >
          <span class="status-option__label">Todas</span>
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['status-option', { 'status-option--active': photoCategoryId === cat.id }]"
          @click="emit('update:photoCategoryId', cat.id)"
        >
          <span class="status-option__label">{{ cat.name }}</span>
          <span class="status-option__count">{{ cat.photoCount }}</span>
        </button>
      </NFlex>
    </div>

    <div class="filter-section">
      <p class="filter-section__title">Colores detectados</p>

      <p class="filter-subsection">Casco / Ropa</p>
      <div class="color-grid">
        <NTooltip v-for="color in PALETTE_OPTIONS" :key="'h-' + color.name" :delay="300">
          <template #trigger>
            <div
              class="color-dot"
              :class="{
                'color-dot--selected':
                  helmetColors.includes(color.name) || clothingColors.includes(color.name),
              }"
              :style="{ backgroundColor: color.hex }"
              @click="emit('update:helmetColors', toggleColor(helmetColors, color.name))"
              @click.right.prevent="
                emit('update:clothingColors', toggleColor(clothingColors, color.name))
              "
            />
          </template>
          <span>{{ color.label }}<br /><small>Click = casco · Click der. = ropa</small></span>
        </NTooltip>
      </div>
      <NFlex
        v-if="helmetColors.length || clothingColors.length"
        :size="4"
        wrap
        style="margin-top: 6px"
      >
        <span
          v-for="c in helmetColors"
          :key="'hc-' + c"
          class="color-tag"
          @click="emit('update:helmetColors', toggleColor(helmetColors, c))"
        >
          🪖 {{ COLOR_PALETTE_LABELS[c as ColorName] }} ✕
        </span>
        <span
          v-for="c in clothingColors"
          :key="'cc-' + c"
          class="color-tag"
          @click="emit('update:clothingColors', toggleColor(clothingColors, c))"
        >
          👕 {{ COLOR_PALETTE_LABELS[c as ColorName] }} ✕
        </span>
      </NFlex>

      <p class="filter-subsection" style="margin-top: 12px">Bicicleta</p>
      <div class="color-grid">
        <NTooltip v-for="color in PALETTE_OPTIONS" :key="'b-' + color.name" :delay="300">
          <template #trigger>
            <div
              class="color-dot"
              :class="{ 'color-dot--selected': bikeColors.includes(color.name) }"
              :style="{ backgroundColor: color.hex }"
              @click="emit('update:bikeColors', toggleColor(bikeColors, color.name))"
            />
          </template>
          {{ color.label }}
        </NTooltip>
      </div>
      <NFlex v-if="bikeColors.length" :size="4" wrap style="margin-top: 6px">
        <span
          v-for="c in bikeColors"
          :key="'bc-' + c"
          class="color-tag"
          @click="emit('update:bikeColors', toggleColor(bikeColors, c))"
        >
          🚲 {{ COLOR_PALETTE_LABELS[c as ColorName] }} ✕
        </span>
      </NFlex>
    </div>

    <NButton v-if="hasActiveFilters" block type="error" ghost @click="emit('clearFilters')">
      Limpiar filtros
    </NButton>
  </aside>
</template>

<style scoped src="./gallery-filter-sidebar.css" />
