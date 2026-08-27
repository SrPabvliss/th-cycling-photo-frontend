<script setup lang="ts">
import { computed } from 'vue'
import { NDatePicker, NInputNumber, NSelect } from 'naive-ui'

import {
  GENDER_LABELS,
  SORT_LABELS,
  useInjectedBuyerFilterState,
} from '../../../composables/use-buyer-filters'
import {
  BUYER_GENDERS,
  BUYER_SORTS,
  type BuyerGender,
  type BuyerSort,
} from '../../../types/requests/buyer-filters.request'
import type { ICountry } from '@/features/locations/types/country.types'
import type { IProvince } from '@/features/locations/types/province.types'

export type BuyerFilterFieldGroup = 'location' | 'registered' | 'genderAge' | 'more' | 'sort'

const props = withDefaults(
  defineProps<{
    countries: ICountry[]
    provinces: IProvince[]
    loadingProvinces: boolean
    stacked?: boolean
    groups?: BuyerFilterFieldGroup[]
  }>(),
  { groups: () => ['location', 'registered', 'genderAge', 'more', 'sort'] },
)

const filterState = useInjectedBuyerFilterState()

function shows(group: BuyerFilterFieldGroup): boolean {
  return props.groups.includes(group)
}

const countryOptions = computed(() =>
  props.countries.map((country) => ({ label: country.name, value: country.id })),
)
const provinceOptions = computed(() =>
  props.provinces.map((province) => ({ label: province.name, value: province.id })),
)
const genderOptions = BUYER_GENDERS.map((gender: BuyerGender) => ({
  label: GENDER_LABELS[gender],
  value: gender,
}))
const sortOptions = BUYER_SORTS.map((sort: BuyerSort) => ({
  label: SORT_LABELS[sort],
  value: sort,
}))
const triStateOptions = [
  { label: 'Sí', value: 'true' },
  { label: 'No', value: 'false' },
]

function triStateValue(value: boolean | null): string | null {
  if (value == null) return null
  return value ? 'true' : 'false'
}

function fromTriState(value: string | null): boolean | null {
  if (value == null) return null
  return value === 'true'
}

const registeredRange = computed<[number, number] | null>({
  get() {
    const { registeredFrom, registeredTo } = filterState
    if (!registeredFrom.value || !registeredTo.value) return null
    return [
      new Date(`${registeredFrom.value}T00:00:00`).getTime(),
      new Date(`${registeredTo.value}T00:00:00`).getTime(),
    ]
  },
  set(value) {
    if (value == null) {
      filterState.registeredFrom.value = null
      filterState.registeredTo.value = null
      return
    }
    const [from, to] = value
    filterState.registeredFrom.value = new Date(from).toISOString().slice(0, 10)
    filterState.registeredTo.value = new Date(to).toISOString().slice(0, 10)
  },
})

function selectCountry(value: number | null) {
  filterState.countryId.value = value
  filterState.provinceId.value = null
}
</script>

<template>
  <div class="bff" :class="{ 'bff--stacked': stacked }">
    <template v-if="shows('location')">
      <div class="bff-field">
        <span v-if="stacked" class="bff-field__label">País</span>
        <NSelect
          :value="filterState.countryId.value"
          placeholder="País"
          clearable
          filterable
          :options="countryOptions"
          @update:value="selectCountry"
        />
      </div>
      <div class="bff-field">
        <span v-if="stacked" class="bff-field__label">Provincia</span>
        <NSelect
          :value="filterState.provinceId.value"
          placeholder="Provincia"
          clearable
          filterable
          :disabled="filterState.countryId.value == null"
          :loading="loadingProvinces"
          :options="provinceOptions"
          @update:value="(value: number | null) => (filterState.provinceId.value = value)"
        />
      </div>
    </template>

    <div v-if="shows('registered')" class="bff-field">
      <span v-if="stacked" class="bff-field__label">Fecha de registro</span>
      <NDatePicker
        v-model:value="registeredRange"
        type="daterange"
        clearable
        format="dd-MMM-yyyy"
        start-placeholder="Desde"
        end-placeholder="Hasta"
      />
    </div>

    <template v-if="shows('genderAge')">
      <div class="bff-field">
        <span v-if="stacked" class="bff-field__label">Género</span>
        <NSelect
          :value="filterState.gender.value"
          placeholder="Género"
          clearable
          :options="genderOptions"
          @update:value="
            (value: typeof filterState.gender.value) => (filterState.gender.value = value)
          "
        />
      </div>
      <div class="bff-field bff-field--age">
        <span v-if="stacked" class="bff-field__label">Edad</span>
        <div class="bff-age-range">
          <NInputNumber
            :value="filterState.ageFrom.value"
            placeholder="Desde"
            :min="0"
            @update:value="(value: number | null) => (filterState.ageFrom.value = value)"
          />
          <NInputNumber
            :value="filterState.ageTo.value"
            placeholder="Hasta"
            :min="0"
            @update:value="(value: number | null) => (filterState.ageTo.value = value)"
          />
        </div>
      </div>
    </template>

    <template v-if="shows('more')">
      <div class="bff-field">
        <span v-if="stacked" class="bff-field__label">Correo verificado</span>
        <NSelect
          :value="triStateValue(filterState.emailVerified.value)"
          placeholder="Correo verificado"
          clearable
          :options="triStateOptions"
          @update:value="
            (value: string | null) => (filterState.emailVerified.value = fromTriState(value))
          "
        />
      </div>
      <div class="bff-field">
        <span v-if="stacked" class="bff-field__label">Tiene WhatsApp</span>
        <NSelect
          :value="triStateValue(filterState.hasWhatsapp.value)"
          placeholder="Tiene WhatsApp"
          clearable
          :options="triStateOptions"
          @update:value="
            (value: string | null) => (filterState.hasWhatsapp.value = fromTriState(value))
          "
        />
      </div>
    </template>

    <div v-if="shows('sort')" class="bff-field">
      <span v-if="stacked" class="bff-field__label">Ordenar por</span>
      <NSelect
        :value="filterState.sort.value"
        :options="sortOptions"
        @update:value="(value: typeof filterState.sort.value) => (filterState.sort.value = value)"
      />
    </div>
  </div>
</template>

<style scoped src="./buyer-filter-fields.css" />
