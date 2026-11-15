<script setup lang="ts">
import { computed, ref } from 'vue'

import type { IPublicEventFilterOption } from '@/shared/public-events'
import { matchesSearch } from '../../../utils/event-filters'

// Disciplines or provinces: a search always on top, then one checkbox per choice with how many
// events it would bring. Several at once. The order is the api's (by name) and never changes
// while choosing; a choice that brings nothing stays, dimmed, and can still be unmarked.
const props = defineProps<{
  options: IPublicEventFilterOption[]
  placeholder: string
  /** What to say when the search matches nothing offered. */
  miss: (search: string) => string
}>()

const chosen = defineModel<number[]>({ required: true })

const search = ref('')
const shown = computed(() =>
  props.options.filter((option) => matchesSearch(option.name, search.value)),
)

const isChosen = (id: number) => chosen.value.includes(id)
const isIdle = (option: IPublicEventFilterOption) => option.count === 0 && !isChosen(option.id)

function toggle(option: IPublicEventFilterOption) {
  if (isChosen(option.id)) chosen.value = chosen.value.filter((id) => id !== option.id)
  else if (!isIdle(option)) chosen.value = [...chosen.value, option.id]
}
</script>

<template>
  <div class="filter-options">
    <input
      v-model="search"
      class="filter-options__search"
      type="search"
      :placeholder="placeholder"
      :aria-label="placeholder"
      autocomplete="off"
    />

    <div class="filter-options__list">
      <button
        v-for="option in shown"
        :key="option.id"
        type="button"
        class="filter-option"
        :class="{ 'filter-option--idle': option.count === 0 }"
        role="menuitemcheckbox"
        :aria-checked="isChosen(option.id) ? 'true' : 'false'"
        :aria-disabled="isIdle(option) ? 'true' : undefined"
        :title="option.name"
        @click="toggle(option)"
      >
        <span class="filter-option__box" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
        </span>
        <span class="filter-option__name">{{ option.name }}</span>
        <span class="filter-option__count">{{ option.count }}</span>
      </button>

      <p v-if="shown.length === 0" class="filter-options__miss">{{ miss(search) }}</p>
    </div>
  </div>
</template>

<style scoped>
.filter-options {
  /* Rows: one height in both menus; the list scrolls inside the menu and they never shrink. */
  --filter-option-height: var(--tt-control-l);
  --filter-options-rows: 6.5;

  display: flex;
  flex-direction: column;
  min-block-size: 0;
}

.filter-options__search {
  flex: none;
  block-size: var(--tt-control-m);
  margin-block-end: var(--tt-space-2);
  padding-inline: var(--tt-space-3);
  border: 0;
  border-radius: var(--tt-radius-m);
  background: var(--tt-surface-sunken);
  color: var(--tt-ink);
  font-family: inherit;
  /* Body size keeps iOS from zooming into the field. */
  font-size: var(--tt-type-body-size);
}

.filter-options__search::placeholder {
  color: var(--tt-ink-muted);
}

.filter-options__list {
  display: flex;
  flex-direction: column;
  max-block-size: calc(var(--filter-option-height) * var(--filter-options-rows));
  overflow-y: auto;
  overscroll-behavior: contain;
}

.filter-option {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--tt-space-3);
  inline-size: 100%;
  block-size: var(--filter-option-height);
  padding-inline: var(--tt-space-2);
  border: 0;
  border-radius: var(--tt-radius-m);
  background: none;
  color: var(--tt-ink);
  text-align: start;
  font-family: inherit;
  font-size: var(--tt-type-body-size);
  line-height: var(--tt-type-body-line);
  cursor: pointer;
}

.filter-option:hover {
  background: var(--tt-surface-sunken);
}

.filter-option[aria-checked='true'] {
  font-weight: var(--tt-type-title-weight);
}

.filter-option--idle {
  color: var(--tt-ink-muted);
}

.filter-option[aria-disabled='true'] {
  cursor: default;
}

.filter-option[aria-disabled='true']:hover {
  background: none;
}

.filter-option__box {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  inline-size: var(--tt-icon-l);
  block-size: var(--tt-icon-l);
  border: thin solid var(--tt-ink-muted);
  border-radius: var(--tt-radius-s);
}

.filter-option__box svg {
  inline-size: var(--tt-icon-s);
  block-size: var(--tt-icon-s);
  fill: none;
  stroke: var(--tt-on-primary);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  visibility: hidden;
}

.filter-option[aria-checked='true'] .filter-option__box {
  border-color: var(--tt-primary);
  background: var(--tt-primary);
}

.filter-option[aria-checked='true'] .filter-option__box svg {
  visibility: visible;
}

.filter-option--idle .filter-option__box {
  opacity: 0.5;
}

.filter-option__name {
  flex: 1;
  min-inline-size: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-option__count {
  flex: none;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
  font-variant-numeric: tabular-nums;
}

.filter-options__miss {
  margin: 0;
  padding: var(--tt-space-4) var(--tt-space-2);
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-s-size);
  line-height: var(--tt-type-body-s-line);
}

@media (min-width: 768px) {
  .filter-options {
    --filter-option-height: var(--tt-control-m);
  }

  .filter-options__search {
    font-size: var(--tt-type-body-s-size);
  }
}
</style>
