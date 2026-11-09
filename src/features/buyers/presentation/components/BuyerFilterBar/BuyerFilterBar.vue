<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDebounceFn, useMediaQuery } from '@vueuse/core'
import { NButton, NDrawer, NDrawerContent, NIcon, NPopover, NSelect } from 'naive-ui'
import { ChevronDownOutline, CloseOutline, FunnelOutline, SearchOutline } from '@vicons/ionicons5'

import { useCountriesQuery } from '@/features/locations/composables/queries/use-countries'
import { useProvincesByCountryQuery } from '@/features/locations/composables/queries/use-provinces-by-country'
import { SORT_LABELS, useInjectedBuyerFilterState } from '../../../composables/use-buyer-filters'
import { BUYER_SORTS } from '../../../types/requests/buyer-filters.request'
import BuyerFilterFields from './BuyerFilterFields.vue'

const props = defineProps<{
  resultsCount: number | null
}>()

const filterState = useInjectedBuyerFilterState()

const isMobile = useMediaQuery('(max-width: 767px)')
const showSheet = ref(false)

const searchInput = ref(filterState.search.value ?? '')
const debouncedApply = useDebounceFn((value: string | null) => {
  filterState.search.value = value ? value : null
}, 400)

watch(searchInput, (value) => debouncedApply(value || null))
watch(
  () => filterState.search.value,
  (value) => {
    if (value !== searchInput.value) searchInput.value = value ?? ''
  },
)

const countryId = computed(() => filterState.countryId.value)
const { data: countries } = useCountriesQuery()
const { data: provinces, isPending: loadingProvinces } = useProvincesByCountryQuery(countryId)

const activeCount = computed(() => filterState.activeChips.value.length)
const filterSheetBadgeCount = computed(
  () => filterState.activeChips.value.filter((chip) => chip.id !== 'purchase').length,
)

const locationOn = computed(
  () => filterState.countryId.value != null || filterState.provinceId.value != null,
)
const registeredOn = computed(
  () => filterState.registeredFrom.value != null || filterState.registeredTo.value != null,
)
const genderAgeOn = computed(
  () =>
    filterState.gender.value != null ||
    filterState.ageFrom.value != null ||
    filterState.ageTo.value != null,
)
const moreCount = computed(
  () =>
    Number(filterState.emailVerified.value != null) + Number(filterState.hasWhatsapp.value != null),
)

const sortOptions = BUYER_SORTS.map((sort) => ({ label: SORT_LABELS[sort], value: sort }))

const locationLabel = computed(() =>
  locationOn.value ? 'Ubicación seleccionada' : 'País o provincia',
)

const applyLabel = computed(() =>
  props.resultsCount != null
    ? `Ver ${props.resultsCount} comprador${props.resultsCount === 1 ? '' : 'es'}`
    : 'Aplicar filtros',
)
</script>

<template>
  <div class="bfb">
    <template v-if="!isMobile">
      <div class="bfb-bar">
        <div class="bfb-search">
          <NIcon :component="SearchOutline" :size="15" />
          <input v-model="searchInput" placeholder="Buscar por nombre, correo o teléfono…" />
        </div>

        <NPopover trigger="click" placement="bottom-start" :show-arrow="false">
          <template #trigger>
            <button type="button" class="bfb-sel" :class="{ 'bfb-sel--on': locationOn }">
              {{ locationLabel }}
              <NIcon :component="ChevronDownOutline" :size="14" />
            </button>
          </template>
          <BuyerFilterFields
            :countries="countries ?? []"
            :provinces="provinces ?? []"
            :loading-provinces="loadingProvinces"
            :groups="['location']"
            stacked
          />
        </NPopover>

        <NPopover trigger="click" placement="bottom-start" :show-arrow="false">
          <template #trigger>
            <button type="button" class="bfb-sel" :class="{ 'bfb-sel--on': registeredOn }">
              Fecha de registro
              <NIcon :component="ChevronDownOutline" :size="14" />
            </button>
          </template>
          <BuyerFilterFields
            :countries="countries ?? []"
            :provinces="provinces ?? []"
            :loading-provinces="loadingProvinces"
            :groups="['registered']"
            stacked
          />
        </NPopover>

        <NPopover trigger="click" placement="bottom-start" :show-arrow="false">
          <template #trigger>
            <button type="button" class="bfb-sel" :class="{ 'bfb-sel--on': genderAgeOn }">
              Género y edad
              <NIcon :component="ChevronDownOutline" :size="14" />
            </button>
          </template>
          <BuyerFilterFields
            :countries="countries ?? []"
            :provinces="provinces ?? []"
            :loading-provinces="loadingProvinces"
            :groups="['genderAge']"
            stacked
          />
        </NPopover>

        <NPopover trigger="click" placement="bottom-start" :show-arrow="false">
          <template #trigger>
            <button type="button" class="bfb-more">
              <NIcon :component="FunnelOutline" :size="15" />
              Más filtros
              <span v-if="moreCount > 0" class="bfb-more__n">{{ moreCount }}</span>
            </button>
          </template>
          <BuyerFilterFields
            :countries="countries ?? []"
            :provinces="provinces ?? []"
            :loading-provinces="loadingProvinces"
            :groups="['more']"
            stacked
          />
        </NPopover>

        <div class="bfb-spacer" />

        <NSelect
          class="bfb-sort"
          :value="filterState.sort.value"
          :options="sortOptions"
          @update:value="(value: typeof filterState.sort.value) => (filterState.sort.value = value)"
        />
      </div>
      <div v-if="activeCount > 0" class="bfb-chips">
        <span v-for="chip in filterState.activeChips.value" :key="chip.id" class="bfb-chip">
          {{ chip.label }}
          <button type="button" aria-label="Quitar filtro" @click="chip.clear()">
            <NIcon :component="CloseOutline" :size="12" />
          </button>
        </span>
        <button type="button" class="bfb-clear" @click="filterState.clearAll()">
          Limpiar todo
        </button>
      </div>
    </template>

    <template v-else>
      <div class="bfb-mrow">
        <div class="bfb-search">
          <NIcon :component="SearchOutline" :size="15" />
          <input v-model="searchInput" placeholder="Nombre, correo o teléfono…" />
        </div>
        <button type="button" class="bfb-mbtn" aria-label="Filtros" @click="showSheet = true">
          <NIcon :component="FunnelOutline" :size="16" />
          <span v-if="filterSheetBadgeCount > 0" class="bfb-mbtn__badge">{{
            filterSheetBadgeCount
          }}</span>
        </button>
      </div>
      <div v-if="activeCount > 0" class="bfb-mchips">
        <span v-for="chip in filterState.activeChips.value" :key="chip.id" class="bfb-chip">
          {{ chip.label }}
          <button type="button" aria-label="Quitar filtro" @click="chip.clear()">
            <NIcon :component="CloseOutline" :size="11" />
          </button>
        </span>
      </div>

      <NDrawer v-model:show="showSheet" placement="bottom" height="82%">
        <NDrawerContent title="Filtros" closable>
          <BuyerFilterFields
            :countries="countries ?? []"
            :provinces="provinces ?? []"
            :loading-provinces="loadingProvinces"
            stacked
          />
          <template #footer>
            <div class="bfb-sheet-footer">
              <NButton v-if="activeCount > 0" quaternary @click="filterState.clearAll()">
                Limpiar
              </NButton>
              <NButton type="primary" @click="showSheet = false">{{ applyLabel }}</NButton>
            </div>
          </template>
        </NDrawerContent>
      </NDrawer>
    </template>
  </div>
</template>

<style scoped src="./buyer-filter-bar.css" />
