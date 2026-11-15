<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEventListener } from '@vueuse/core'

import type { IPublicEventFilterOptions } from '@/shared/public-events'
import type { IMonthRange } from '../../../composables/use-event-list-filters'
import { choiceLabel, monthsLabel, provinceSearchMiss } from '../../../utils/event-filters'
import FilterMenu from './FilterMenu.vue'
import MonthsPanel from './MonthsPanel.vue'
import OptionsPanel from './OptionsPanel.vue'

type MenuKey = 'types' | 'provinces' | 'months'

// Three equal buttons, Disciplina, Provincia and Fecha, each opening its menu. The list changes
// while choosing: there is nothing to apply. A button says what is chosen and, then, has a cross
// that clears it; "Limpiar" at the end clears the three.
const props = defineProps<{
  /** Without them the buttons still work with what is chosen; the menus wait for them. */
  options: IPublicEventFilterOptions | undefined
  /** Events the list has with the current filters; null while unknown. */
  total: number | null
}>()

const eventTypeIds = defineModel<number[]>('eventTypeIds', { required: true })
const provinceIds = defineModel<number[]>('provinceIds', { required: true })
const months = defineModel<IMonthRange | null>('months', { required: true })

const NAMES: Record<MenuKey, string> = {
  types: 'Disciplina',
  provinces: 'Provincia',
  months: 'Fecha',
}

const eventTypes = computed(() => props.options?.eventTypes ?? [])
const allProvinces = computed(() => props.options?.provinces ?? [])
// Only the provinces with races are offered; the others answer a search that finds them. One
// chosen without races (an old link) stays in the list, dimmed, so it can be taken out there.
const provinces = computed(() =>
  allProvinces.value.filter(
    (province) => province.hasEvents || provinceIds.value.includes(province.id),
  ),
)

const row = ref<HTMLElement | null>(null)
const buttons = ref<Partial<Record<MenuKey, HTMLElement>>>({})
const open = ref<MenuKey | null>(null)

const isChosen = computed<Record<MenuKey, boolean>>(() => ({
  types: eventTypeIds.value.length > 0,
  provinces: provinceIds.value.length > 0,
  months: months.value !== null,
}))
const hasChoices = computed(() => Object.values(isChosen.value).some(Boolean))

const labels = computed(() => ({
  types: choiceLabel(eventTypeIds.value, eventTypes.value, NAMES.types),
  provinces: choiceLabel(provinceIds.value, allProvinces.value, NAMES.provinces),
  months: { text: monthsLabel(months.value), more: null },
}))

function toggle(key: MenuKey) {
  open.value = open.value === key ? null : key
}

function clear(key: MenuKey) {
  if (key === 'types') eventTypeIds.value = []
  else if (key === 'provinces') provinceIds.value = []
  else months.value = null
}

function clearAll() {
  eventTypeIds.value = []
  provinceIds.value = []
  months.value = null
}

const close = () => (open.value = null)

// Back and forward leave the menu behind: it closes.
useEventListener(window, 'popstate', close)

function setButton(key: MenuKey, element: unknown) {
  if (element instanceof HTMLElement) buttons.value[key] = element
}
</script>

<template>
  <div ref="row" class="event-filters" role="group" aria-label="Filtros">
    <span
      v-for="key in ['types', 'provinces', 'months'] as const"
      :key="key"
      class="event-filter"
      :class="{ 'event-filter--on': isChosen[key] }"
    >
      <button
        :ref="(element) => setButton(key, element)"
        type="button"
        class="event-filter__open tt-hit-area"
        aria-haspopup="menu"
        :aria-expanded="open === key ? 'true' : 'false'"
        :data-filter="key"
        @click="toggle(key)"
      >
        <span class="event-filter__label">{{ labels[key].text }}</span>
        <span v-if="labels[key].more" class="event-filter__more">{{ labels[key].more }}</span>
        <svg
          v-if="!isChosen[key]"
          class="event-filter__icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <button
        v-if="isChosen[key]"
        type="button"
        class="event-filter__clear tt-hit-area"
        :aria-label="`Quitar ${NAMES[key].toLowerCase()}`"
        @click="clear(key)"
      >
        <svg class="event-filter__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </span>

    <button
      v-if="hasChoices"
      type="button"
      class="event-filters__clear-all tt-hit-area"
      @click="clearAll"
    >
      Limpiar
    </button>

    <FilterMenu
      :open="open !== null"
      :anchor="open ? (buttons[open] ?? null) : null"
      :bounds="row"
      :label="open ? NAMES[open] : ''"
      :wide="open === 'months'"
      :can-clear="open ? isChosen[open] : false"
      :total="total"
      @close="close"
      @clear="open && clear(open)"
    >
      <OptionsPanel
        v-if="open === 'types'"
        v-model="eventTypeIds"
        :options="eventTypes"
        placeholder="Busca una disciplina"
        :miss="() => 'No encontramos esa disciplina.'"
      />
      <OptionsPanel
        v-else-if="open === 'provinces'"
        v-model="provinceIds"
        :options="provinces"
        placeholder="Busca una provincia"
        :miss="(search) => provinceSearchMiss(allProvinces, search)"
      />
      <MonthsPanel v-else-if="open === 'months'" v-model="months" :months="options?.months ?? []" />
    </FilterMenu>
  </div>
</template>

<style scoped>
/* One row that scrolls sideways on a phone, with no visible scrollbar. */
.event-filters {
  display: flex;
  align-items: center;
  gap: var(--tt-space-2);
  /* Room for the buttons' 44 px touch zone, which a scrolling row would otherwise clip. */
  padding-block: calc((var(--tt-control-m) - var(--tt-control-s)) / 2);
  margin-block: calc((var(--tt-control-m) - var(--tt-control-s)) / -2);
  overflow-x: auto;
  scrollbar-width: none;
}

.event-filters::-webkit-scrollbar {
  display: none;
}

.event-filter {
  display: inline-flex;
  flex: none;
  align-items: center;
  block-size: var(--tt-control-s);
  border: thin solid var(--tt-line);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  transition:
    background-color var(--tt-motion-fast) var(--tt-easing-standard),
    border-color var(--tt-motion-fast) var(--tt-easing-standard),
    color var(--tt-motion-fast) var(--tt-easing-standard);
}

.event-filter:hover {
  border-color: var(--tt-primary-soft-border);
}

.event-filter--on {
  border-color: var(--tt-primary-soft-border);
  background: var(--tt-primary-soft);
  color: var(--tt-primary-ink);
}

.event-filter__open,
.event-filter__clear {
  display: inline-flex;
  align-items: center;
  block-size: 100%;
  border: 0;
  border-radius: var(--tt-radius-pill);
  background: none;
  color: inherit;
  font-family: var(--tt-font-sans);
  font-size: var(--tt-type-body-s-medium-size);
  line-height: var(--tt-type-body-s-medium-line);
  font-weight: var(--tt-type-title-weight);
  cursor: pointer;
}

.event-filter__open {
  gap: var(--tt-space-1);
  padding-inline: var(--tt-space-3);
  white-space: nowrap;
}

.event-filter--on .event-filter__open {
  padding-inline-end: var(--tt-space-1);
}

/* A long province name never pushes the other buttons out of reach. */
.event-filter__label {
  max-inline-size: calc(var(--tt-ilu-inline) + var(--tt-space-5));
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-filter__more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: var(--tt-icon-l);
  block-size: var(--tt-icon-l);
  padding-inline: var(--tt-space-1);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-primary);
  color: var(--tt-on-primary);
  font-size: var(--tt-type-label-size);
  line-height: var(--tt-type-label-line);
}

.event-filter__clear {
  justify-content: center;
  inline-size: calc(var(--tt-control-s) - var(--tt-space-2));
  block-size: calc(var(--tt-control-s) - var(--tt-space-2));
  margin-inline-end: var(--tt-space-1);
}

.event-filter__clear:hover {
  background: var(--tt-primary-soft-border);
}

.event-filter__icon {
  flex: none;
  inline-size: var(--tt-icon-s);
  block-size: var(--tt-icon-s);
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.event-filter__open[aria-expanded='true'] .event-filter__icon {
  rotate: 180deg;
}

.event-filters__clear-all {
  flex: none;
  block-size: var(--tt-control-s);
  padding-inline: var(--tt-space-2);
  border: 0;
  background: none;
  color: var(--tt-primary-ink);
  font-family: var(--tt-font-sans);
  font-size: var(--tt-type-body-s-medium-size);
  font-weight: var(--tt-type-title-weight);
  white-space: nowrap;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .event-filter {
    transition: none;
  }
}
</style>
