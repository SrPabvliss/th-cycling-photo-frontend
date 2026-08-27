<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { AlertCircleOutline, CloseOutline, SearchOutline } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import type { IPickablePerson } from '../../../types/responses/pickable-person.response'

withDefaults(
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

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
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
      data-test="picked-person-clear"
      @click="emit('clear')"
    >
      <NIcon :component="CloseOutline" :size="14" />
    </button>
  </div>

  <div v-else class="pp-picker">
    <div class="pp-search">
      <NIcon :component="SearchOutline" :size="15" />
      <input
        :value="search"
        placeholder="Buscar por nombre o correo…"
        data-test="person-search-input"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <ul v-if="users.length > 0" class="pp-list" data-test="person-picker-list">
      <li
        v-for="user in users"
        :key="user.id"
        class="pp-list__item"
        :data-test="`person-option-${user.id}`"
        @click="emit('pick', user)"
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
    <p v-else-if="search.trim().length > 0" class="pp-status">Sin resultados.</p>

    <p class="pp-note" data-test="person-picker-note">
      <NIcon :component="AlertCircleOutline" :size="13" />
      Solo aparecen personas con cuenta en Titan TV. Si no tiene cuenta, debe registrarse antes.
    </p>
  </div>
</template>

<style scoped src="./person-picker.css" />
