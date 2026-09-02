<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { NIcon } from 'naive-ui'
import { AlertCircleOutline, CloseOutline, SearchOutline } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import type { IPickablePerson } from '../../../types/responses/pickable-person.response'

const props = withDefaults(
  defineProps<{
    picked: IPickablePerson | null
    users: IPickablePerson[]
    search: string
    loading?: boolean
    rejected?: boolean
    locked?: boolean
  }>(),
  {
    loading: false,
    rejected: false,
    locked: false,
  },
)

const emit = defineEmits<{
  'update:search': [value: string]
  pick: [person: IPickablePerson]
  clear: []
}>()

const focused = ref(false)
const activeIndex = ref(-1)
const inputEl = ref<HTMLInputElement | null>(null)
const popEl = ref<HTMLElement | null>(null)

const hasQuery = computed(() => props.search.trim().length > 0)
const isOpen = computed(() => focused.value && hasQuery.value)
const showResults = computed(() => isOpen.value && props.users.length > 0)
const showEmpty = computed(() => isOpen.value && !props.loading && props.users.length === 0)

watch(
  () => props.users,
  (users) => (activeIndex.value = users.length > 0 ? 0 : -1),
)

/** The modal body scrolls, so an absolutely placed panel can open below its visible edge. */
watch(showResults, (open) => {
  if (!open) return
  void nextTick(() => popEl.value?.scrollIntoView({ block: 'nearest' }))
})

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function move(step: number) {
  if (!showResults.value) return
  const total = props.users.length
  activeIndex.value = (activeIndex.value + step + total) % total
}

function choose(person: IPickablePerson) {
  emit('pick', person)
  focused.value = false
  activeIndex.value = -1
}

function chooseActive(event: KeyboardEvent) {
  const person = props.users[activeIndex.value]
  if (!person) return

  event.preventDefault()
  choose(person)
}

function focusSearch() {
  inputEl.value?.focus()
}

defineExpose({ focusSearch })
</script>

<template>
  <div
    v-if="picked"
    class="pp-picked"
    :class="{ 'pp-picked--bad': rejected }"
    data-test="picked-person"
  >
    <span class="pp-ava">{{ initials(picked.name) }}</span>
    <div class="pp-picked__txt">
      <b>{{ picked.name }}</b>
      <span
        >{{ picked.email }} <i>· en la plataforma desde {{ formatDate(picked.since) }}</i></span
      >
    </div>
    <button
      v-if="!locked"
      type="button"
      class="pp-iconbtn"
      title="Elegir otra persona"
      data-test="picked-person-clear"
      @click="emit('clear')"
    >
      <NIcon :component="CloseOutline" :size="14" />
    </button>
  </div>

  <div v-else class="pp-picker">
    <div class="pp-anchor">
      <div class="pp-search" :class="{ 'pp-search--open': isOpen }">
        <NIcon :component="SearchOutline" :size="15" />
        <input
          ref="inputEl"
          :value="search"
          placeholder="Buscar por nombre o correo…"
          autocomplete="off"
          role="combobox"
          aria-autocomplete="list"
          :aria-expanded="showResults"
          data-test="person-search-input"
          @input="emit('update:search', ($event.target as HTMLInputElement).value)"
          @focus="focused = true"
          @blur="focused = false"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.enter="chooseActive"
          @keydown.esc="focused = false"
        />
        <button
          v-if="hasQuery"
          type="button"
          class="pp-iconbtn"
          title="Limpiar búsqueda"
          data-test="person-search-clear"
          @mousedown.prevent="emit('update:search', '')"
        >
          <NIcon :component="CloseOutline" :size="14" />
        </button>
      </div>

      <div v-if="showResults || showEmpty || (isOpen && loading)" ref="popEl" class="pp-pop">
        <ul v-if="showResults" class="pp-list" role="listbox" data-test="person-picker-list">
          <li
            v-for="(user, index) in users"
            :key="user.id"
            class="pp-list__item"
            :class="{ 'pp-list__item--active': index === activeIndex }"
            role="option"
            :aria-selected="index === activeIndex"
            :data-test="`person-option-${user.id}`"
            @mousedown.prevent="choose(user)"
            @mouseenter="activeIndex = index"
          >
            <span class="pp-ava pp-ava--sm">{{ initials(user.name) }}</span>
            <div class="pp-list__txt">
              <b>{{ user.name }}</b>
              <span
                >{{ user.email }} <i>· desde {{ formatDate(user.since) }}</i></span
              >
            </div>
            <span v-if="user.hasOrganizer" class="pp-tag" data-test="person-org-badge">
              Ya es {{ user.organizerName ?? 'organizador' }}
            </span>
            <span v-if="!user.emailVerified" class="pp-warn" data-test="person-unverified-badge">
              correo sin verificar
            </span>
          </li>
        </ul>

        <p v-else-if="loading" class="pp-status">Buscando…</p>
        <p v-else class="pp-status">Nadie con ese nombre o correo tiene cuenta en Titan TV.</p>
      </div>
    </div>

    <p class="pp-note" data-test="person-picker-note">
      <NIcon :component="AlertCircleOutline" :size="13" />
      Solo aparecen personas con cuenta en Titan TV. Si no tiene cuenta, debe registrarse antes.
    </p>
  </div>
</template>

<style scoped src="./person-picker.css" />
