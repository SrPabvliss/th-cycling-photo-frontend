<script setup lang="ts">
import { computed, ref } from 'vue'

import { useFocusHandOff } from '@/shared/composables/use-focus-hand-off'

import type { IPublicMonthOption } from '@/shared/public-events'
import type { IMonthRange } from '../../../composables/use-event-list-filters'
import { MONTH_SHORT, monthKey, pickMonth, pickYear } from '../../../utils/event-filters'

// The year on top with arrows, its twelve months with how many events each has; months without
// events are off. A tap chooses a month, a second tap on another makes the range, a tap on the
// only month chosen takes it away. "Todo 2026" takes the year.
const props = defineProps<{
  months: IPublicMonthOption[]
}>()

const range = defineModel<IMonthRange | null>({ required: true })

const counts = computed(() => new Map(props.months.map((each) => [each.month, each.count])))
// The years that have events, oldest first, or this one when none is known yet.
const years = computed(() => {
  const all = [...new Set(props.months.map((each) => Number(each.month.slice(0, 4))))]
  return all.length ? all.sort((a, b) => a - b) : [new Date().getFullYear()]
})

// Opens on the year of what is chosen, or on the newest year with events.
const year = ref(
  range.value ? Number(range.value.to.slice(0, 4)) : years.value[years.value.length - 1]!,
)
// The arrows go to the year before or after that has events: an empty year has nothing to pick.
const previousYear = computed(() => [...years.value].reverse().find((each) => each < year.value))
const nextYear = computed(() => years.value.find((each) => each > year.value))
// An arrow that reaches the first or last year turns off: the focus goes to the other one.
const previousArrow = ref<HTMLButtonElement | null>(null)
const nextArrow = ref<HTMLButtonElement | null>(null)
useFocusHandOff(
  () => previousYear.value !== undefined,
  () => previousArrow.value,
  () => nextArrow.value,
)
useFocusHandOff(
  () => nextYear.value !== undefined,
  () => nextArrow.value,
  () => previousArrow.value,
)

const cells = computed(() =>
  MONTH_SHORT.map((name, index) => {
    const key = monthKey(year.value, index + 1)
    const from = range.value?.from
    const to = range.value?.to
    const inRange = !!from && !!to && key >= from && key <= to
    return {
      key,
      name,
      count: counts.value.get(key) ?? 0,
      inRange,
      isStart: inRange && key === from,
      isEnd: inRange && key === to,
      isEdge: inRange && (key === from || key === to),
    }
  }),
)
const yearCount = computed(() => cells.value.reduce((sum, cell) => sum + cell.count, 0))
const isWholeYear = computed(
  () =>
    range.value?.from === monthKey(year.value, 1) && range.value?.to === monthKey(year.value, 12),
)
const hint = computed(() =>
  range.value && range.value.from === range.value.to
    ? 'Toca otro mes para elegir un rango.'
    : 'Toca un mes. Con un segundo toque eliges un rango.',
)
</script>

<template>
  <div class="filter-months">
    <div class="filter-months__year">
      <button
        ref="previousArrow"
        type="button"
        class="filter-months__arrow"
        aria-label="Año anterior"
        :disabled="previousYear === undefined"
        @click="year = previousYear ?? year"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
      </button>
      <span class="filter-months__year-number" aria-live="polite">{{ year }}</span>
      <button
        ref="nextArrow"
        type="button"
        class="filter-months__arrow"
        aria-label="Año siguiente"
        :disabled="nextYear === undefined"
        @click="year = nextYear ?? year"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
      </button>
    </div>

    <button
      type="button"
      class="filter-months__all"
      :class="{ 'filter-months__all--on': isWholeYear }"
      role="menuitemcheckbox"
      :aria-checked="isWholeYear ? 'true' : 'false'"
      :disabled="yearCount === 0 && !isWholeYear"
      @click="range = pickYear(range, year)"
    >
      Todo {{ year }}
      <span class="filter-months__all-count">{{ yearCount }}</span>
    </button>

    <div class="filter-months__grid">
      <button
        v-for="cell in cells"
        :key="cell.key"
        type="button"
        class="filter-month"
        :class="{
          'filter-month--between': cell.inRange && !cell.isEdge,
          'filter-month--edge': cell.isEdge,
          'filter-month--start': cell.isStart,
          'filter-month--end': cell.isEnd,
        }"
        role="menuitemcheckbox"
        :aria-checked="cell.inRange ? 'true' : 'false'"
        :aria-label="`${cell.name} ${year}, ${cell.count}`"
        :disabled="cell.count === 0 && !cell.inRange"
        @click="range = pickMonth(range, cell.key)"
      >
        {{ cell.name }}
        <small class="filter-month__count">{{ cell.count }}</small>
      </button>
    </div>

    <p class="filter-months__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.filter-months {
  display: flex;
  flex-direction: column;
}

.filter-months__year {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block-end: var(--tt-space-2);
}

.filter-months__year-number {
  font-family: var(--tt-font-display);
  font-stretch: var(--tt-number-stretch);
  font-size: var(--tt-type-heading-m-size);
  line-height: var(--tt-type-heading-m-line);
  font-weight: var(--tt-type-number-weight);
  font-variant-numeric: tabular-nums;
}

.filter-months__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--tt-control-m);
  block-size: var(--tt-control-m);
  border: 0;
  border-radius: var(--tt-radius-m);
  background: none;
  color: var(--tt-ink);
  cursor: pointer;
}

.filter-months__arrow:hover:not(:disabled) {
  background: var(--tt-surface-sunken);
}

.filter-months__arrow:disabled {
  opacity: 0.3;
  cursor: default;
}

.filter-months__arrow svg {
  inline-size: var(--tt-icon-m);
  block-size: var(--tt-icon-m);
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.filter-months__all {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--tt-space-2);
  block-size: var(--tt-control-m);
  margin-block-end: var(--tt-space-2);
  border: thin solid var(--tt-line);
  border-radius: var(--tt-radius-m);
  background: none;
  color: var(--tt-ink);
  font-family: inherit;
  font-size: var(--tt-type-body-s-medium-size);
  font-weight: var(--tt-type-title-weight);
  cursor: pointer;
}

.filter-months__all:disabled {
  opacity: 0.38;
  cursor: default;
}

.filter-months__all-count {
  color: var(--tt-ink-muted);
  font-weight: var(--tt-type-body-weight);
  font-variant-numeric: tabular-nums;
}

.filter-months__all--on {
  border-color: var(--tt-primary);
  background: var(--tt-primary);
  color: var(--tt-on-primary);
}

.filter-months__all--on .filter-months__all-count {
  color: inherit;
}

.filter-months__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  row-gap: var(--tt-space-1);
}

.filter-month {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  block-size: var(--tt-control-l);
  padding: 0;
  border: 0;
  border-radius: var(--tt-radius-m);
  background: none;
  color: var(--tt-ink);
  font-family: inherit;
  font-size: var(--tt-type-body-s-medium-size);
  line-height: var(--tt-type-body-s-medium-line);
  font-weight: var(--tt-type-title-weight);
  cursor: pointer;
}

.filter-month:hover:not(:disabled):not(.filter-month--edge) {
  background: var(--tt-surface-sunken);
}

.filter-month:disabled {
  color: var(--tt-ink-muted);
  opacity: 0.38;
  cursor: default;
}

.filter-month__count {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-label-size);
  line-height: var(--tt-type-label-line);
  font-weight: var(--tt-type-body-weight);
  font-variant-numeric: tabular-nums;
}

.filter-month--between {
  border-radius: 0;
  background: var(--tt-primary-soft);
  color: var(--tt-primary-ink);
}

.filter-month--between:hover:not(:disabled) {
  background: var(--tt-primary-soft);
}

.filter-month--edge {
  border-radius: 0;
  background: var(--tt-primary);
  color: var(--tt-on-primary);
}

.filter-month--edge .filter-month__count {
  color: inherit;
}

.filter-month--start {
  border-start-start-radius: var(--tt-radius-m);
  border-end-start-radius: var(--tt-radius-m);
}

.filter-month--end {
  border-start-end-radius: var(--tt-radius-m);
  border-end-end-radius: var(--tt-radius-m);
}

.filter-months__hint {
  margin: var(--tt-space-2) var(--tt-space-1) 0;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
}
</style>
