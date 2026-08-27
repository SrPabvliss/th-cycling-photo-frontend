<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { CloseOutline, SearchOutline } from '@vicons/ionicons5'

import type {
  BibMatchMode,
  GalleryBibFilter,
  GallerySaleFilter,
  IGalleryFilterState,
} from '@/features/photos/types/gallery-filters.types'
import type { IGalleryFacets } from '@/features/photos/types/responses/gallery-facets.response'
import { COLOR_CLASSIFICATION_ENABLED } from '@/shared/constants/feature-flags'
import { formatNumber } from '@/shared/utils/format.utils'

const props = defineProps<{
  filters: IGalleryFilterState
  facets?: IGalleryFacets
  plateNumber: string
}>()

const emit = defineEmits<{
  'update:bib': [value: GalleryBibFilter | null]
  'update:category': [value: number | null]
  'update:uncategorized': [value: boolean]
  'update:sale': [value: GallerySaleFilter | null]
  'update:plate-number': [value: string]
  'update:bib-match': [value: BibMatchMode]
  clear: []
}>()

interface IBibRow {
  label: string
  value: GalleryBibFilter | null
  count: (facets: IGalleryFacets) => number
  tone?: 'red' | 'amber'
  note?: string
}

const BIB_ROWS: IBibRow[] = [
  { label: 'Todas', value: null, count: (facets) => facets.total },
  {
    label: 'Sin dorsal',
    value: 'none',
    count: (facets) => facets.withoutBib,
    tone: 'red',
    note: 'Nadie las encuentra buscando un número',
  },
  { label: 'Con dorsal', value: 'any', count: (facets) => facets.withBib },
  {
    label: 'Dorsal dudoso',
    value: 'doubtful',
    count: (facets) => facets.doubtfulBib,
    tone: 'amber',
    note: 'Leídos con poca confianza',
  },
  {
    label: 'Corregido por una persona',
    value: 'corrected',
    count: (facets) => facets.correctedBib,
  },
]

interface ISaleRow {
  label: string
  value: GallerySaleFilter
  count: (facets: IGalleryFacets) => number
}

const SALE_ROWS: ISaleRow[] = [
  { label: 'Vendidas', value: 'sold', count: (facets) => facets.sold },
  { label: 'Sin vender', value: 'unsold', count: (facets) => facets.unsold },
]

const categories = computed(() => props.facets?.categories ?? [])

const hasActiveFilters = computed(
  () =>
    !!(
      props.filters.bib ||
      props.filters.photoCategoryId ||
      props.filters.uncategorized ||
      props.filters.sale ||
      props.plateNumber
    ),
)

function formatCount(value: number | undefined): string {
  return value === undefined ? '' : formatNumber(value)
}

function bibCount(row: IBibRow): string {
  return formatCount(props.facets && row.count(props.facets))
}

function saleCount(row: ISaleRow): string {
  return formatCount(props.facets && row.count(props.facets))
}

function onPlateNumberInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:plate-number', value.replace(/\D/g, ''))
}

function clearPlateNumber() {
  emit('update:plate-number', '')
}

function selectBibMatch(mode: BibMatchMode) {
  emit('update:bib-match', mode)
}

function selectBib(value: GalleryBibFilter | null) {
  emit('update:bib', value)
}

function selectUncategorized() {
  emit('update:uncategorized', !props.filters.uncategorized)
}

function selectCategory(id: number) {
  emit('update:category', props.filters.photoCategoryId === id ? null : id)
}

function selectSale(value: GallerySaleFilter) {
  emit('update:sale', props.filters.sale === value ? null : value)
}
</script>

<template>
  <aside class="gp-side">
    <div class="gp-filters">
      <div class="gp-fgroup">
        <h5>BUSCAR POR DORSAL</h5>
        <div class="tt-search inpicker">
          <NIcon :component="SearchOutline" :size="15" />
          <input :value="plateNumber" placeholder="Ej. 142" @input="onPlateNumberInput" />
          <button v-if="plateNumber" type="button" class="gp-x" @click="clearPlateNumber">
            <NIcon :component="CloseOutline" :size="13" />
          </button>
        </div>
        <div class="gp-seg">
          <button
            type="button"
            :class="{ on: filters.bibMatch === 'exact' }"
            @click="selectBibMatch('exact')"
          >
            Exacto
          </button>
          <button
            type="button"
            :class="{ on: filters.bibMatch === 'contains' }"
            @click="selectBibMatch('contains')"
          >
            Contiene
          </button>
        </div>
      </div>

      <div class="gp-fgroup">
        <h5>DORSAL</h5>
        <button
          v-for="row in BIB_ROWS"
          :key="row.label"
          type="button"
          class="gp-frow"
          :class="[row.tone, { on: filters.bib === row.value }]"
          @click="selectBib(row.value)"
        >
          <span class="gp-frow-t">
            {{ row.label }}
            <i v-if="row.note">{{ row.note }}</i>
          </span>
          <b>{{ bibCount(row) }}</b>
        </button>
      </div>

      <div class="gp-fgroup">
        <h5>CATEGORÍA</h5>
        <button
          type="button"
          class="gp-frow amber"
          :class="{ on: filters.uncategorized }"
          @click="selectUncategorized"
        >
          <span class="gp-frow-t">Sin categoría</span>
          <b>{{ formatCount(facets?.uncategorized) }}</b>
        </button>
        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          class="gp-frow"
          :class="{ on: filters.photoCategoryId === category.id }"
          @click="selectCategory(category.id)"
        >
          <span class="gp-frow-t">{{ category.name }}</span>
          <b>{{ formatCount(category.count) }}</b>
        </button>
      </div>

      <div class="gp-fgroup">
        <h5>VENTA</h5>
        <button
          v-for="row in SALE_ROWS"
          :key="row.label"
          type="button"
          class="gp-frow"
          :class="{ on: filters.sale === row.value }"
          @click="selectSale(row.value)"
        >
          <span class="gp-frow-t">{{ row.label }}</span>
          <b>{{ saleCount(row) }}</b>
        </button>
      </div>

      <button
        v-if="hasActiveFilters"
        type="button"
        class="tt-clear big"
        data-test="gallery-filter-clear"
        @click="emit('clear')"
      >
        Quitar los filtros
      </button>

      <p v-if="!COLOR_CLASSIFICATION_ENABLED" class="gp-fnote">
        El color de casco, ropa y bicicleta ya no clasifica: se apagó en la canalización el 3 jun
        2026.
      </p>
    </div>
  </aside>
</template>

<style scoped src="./gallery-filter-panel.css" />
