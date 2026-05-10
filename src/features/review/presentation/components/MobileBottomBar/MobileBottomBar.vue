<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { CreateOutline, ImageOutline, ListOutline } from '@vicons/ionicons5'

import type { MobileSheet } from '../../../types/mobile-sheet.type'

defineProps<{
  openSheet: MobileSheet
  pendingCount: number
  photoIndex: number
  photoTotal: number
  attrsCount: number
}>()

const emit = defineEmits<{
  open: [sheet: MobileSheet]
}>()

function toggle(sheet: 'queue' | 'attrs') {
  emit('open', sheet)
}

function center() {
  emit('open', null)
}
</script>

<template>
  <nav class="mobile-bottom-bar">
    <button
      class="mobile-bottom-bar__tab"
      :data-active="openSheet === 'queue'"
      @click="toggle('queue')"
    >
      <NIcon :component="ListOutline" :size="16" />
      <span>Cola</span>
      <em>{{ pendingCount }}</em>
    </button>
    <button class="mobile-bottom-bar__tab" :data-active="openSheet === null" @click="center">
      <NIcon :component="ImageOutline" :size="16" />
      <span>Foto</span>
      <em>{{ photoIndex + 1 }}/{{ photoTotal }}</em>
    </button>
    <button
      class="mobile-bottom-bar__tab"
      :data-active="openSheet === 'attrs'"
      @click="toggle('attrs')"
    >
      <NIcon :component="CreateOutline" :size="16" />
      <span>Revisar</span>
      <em>{{ attrsCount }}</em>
    </button>
  </nav>
</template>

<style scoped src="./mobile-bottom-bar.css" />
