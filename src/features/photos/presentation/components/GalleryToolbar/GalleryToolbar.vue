<script setup lang="ts">
import { computed, type Component } from 'vue'
import { NCheckbox, NIcon, NSelect } from 'naive-ui'
import { AppsOutline, FilterOutline, GridOutline, ReorderFourOutline } from '@vicons/ionicons5'

import type { GallerySort } from '@/features/photos/types/gallery-filters.types'
import { formatNumber } from '@/shared/utils/format.utils'

import type { GalleryDensity } from '../../../types/gallery-density.types'

export type { GalleryDensity }

const props = defineProps<{
  loaded: number
  total: number
  phrase: string
  dense: GalleryDensity
  sort: GallerySort
  allVisibleSelected: boolean
  activeFilterCount: number
  mobile: boolean
}>()

const emit = defineEmits<{
  'update:dense': [value: GalleryDensity]
  'update:sort': [value: GallerySort]
  'update:all-visible-selected': [value: boolean]
  'open-filters': []
}>()

const SORT_OPTIONS: Array<{ label: string; value: GallerySort }> = [
  { label: 'Subida · más reciente', value: 'recent' },
  { label: 'Sin dorsal primero', value: 'no_bib_first' },
  { label: 'Dorsal ascendente', value: 'bib_asc' },
  { label: 'Nombre de archivo', value: 'filename' },
]

const DENSITY_OPTIONS: Array<{ key: GalleryDensity; title: string; icon: Component }> = [
  { key: 'comfortable', title: 'Cuadrícula cómoda', icon: GridOutline },
  { key: 'compact', title: 'Cuadrícula compacta', icon: AppsOutline },
  { key: 'list', title: 'Lista para auditar', icon: ReorderFourOutline },
]

const visibleDensityOptions = computed(() =>
  DENSITY_OPTIONS.filter((option) => option.key !== 'list' || !props.mobile),
)
</script>

<template>
  <div class="gp-toolbar">
    <div class="gp-tb-l">
      <button
        v-if="mobile"
        type="button"
        class="gp-filters-toggle"
        data-test="gallery-toolbar-filters"
        @click="emit('open-filters')"
      >
        <NIcon :component="FilterOutline" :size="14" />
        Filtros
        <i v-if="activeFilterCount > 0" class="gp-fdot">{{ activeFilterCount }}</i>
      </button>
      <NCheckbox
        :checked="allVisibleSelected"
        @update:checked="emit('update:all-visible-selected', $event)"
      >
        Todo lo visible
      </NCheckbox>
      <span class="gp-count">
        <b>{{ formatNumber(loaded) }}</b> cargadas de <b>{{ formatNumber(total) }}</b> {{ phrase }}
      </span>
    </div>
    <div class="gp-tb-r">
      <NSelect
        class="gp-sort"
        :value="sort"
        :options="SORT_OPTIONS"
        :consistent-menu-width="false"
        @update:value="emit('update:sort', $event)"
      />
      <div class="gp-dense">
        <button
          v-for="option in visibleDensityOptions"
          :key="option.key"
          type="button"
          :class="{ on: dense === option.key }"
          :title="option.title"
          @click="emit('update:dense', option.key)"
        >
          <NIcon :component="option.icon" :size="15" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped src="./gallery-toolbar.css" />
