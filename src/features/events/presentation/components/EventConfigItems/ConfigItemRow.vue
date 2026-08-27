<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import { NIcon } from 'naive-ui'
import {
  BusinessOutline,
  CardOutline,
  ChevronDownOutline,
  ImageOutline,
  LibraryOutline,
  LogoWhatsapp,
} from '@vicons/ionicons5'

import type {
  ConfigurationItemIcon,
  ConfigurationItemState,
} from '../../../composables/use-configuration-items'

const props = defineProps<{
  label: string
  icon: ConfigurationItemIcon
  state: ConfigurationItemState
  summary: string
  open: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const ICONS: Record<ConfigurationItemIcon, Component> = {
  building: BusinessOutline,
  image: ImageOutline,
  whatsapp: LogoWhatsapp,
  card: CardOutline,
  bank: LibraryOutline,
}

const CHIPS: Record<ConfigurationItemState, { tone: string; text: string }> = {
  profile: { tone: 'ok', text: 'Del perfil' },
  new: { tone: 'new', text: 'Solo este evento' },
  missing: { tone: 'bad', text: 'Falta' },
}

const iconComponent = computed(() => ICONS[props.icon])
const chip = computed(() => CHIPS[props.state])
const actionLabel = computed(() => {
  if (props.open) return 'Cerrar'
  return props.state === 'missing' ? 'Completar' : 'Cambiar'
})
</script>

<template>
  <section class="ce-item" :class="[state, { open }]" data-test="config-item">
    <button class="ce-item-head" type="button" data-test="config-item-head" @click="emit('toggle')">
      <span class="ce-item-ic"><NIcon :component="iconComponent" :size="17" /></span>
      <span class="ce-item-t">
        <b>{{ label }}</b>
        <i data-test="config-item-summary">{{ summary }}</i>
      </span>
      <span class="ce-chip" :class="chip.tone" data-test="config-item-chip">{{ chip.text }}</span>
      <span class="ce-item-act">
        {{ actionLabel }}
        <NIcon :component="ChevronDownOutline" :size="14" :class="{ flipped: open }" />
      </span>
    </button>
    <div v-if="open" class="ce-item-body" data-test="config-item-body">
      <slot />
    </div>
  </section>
</template>

<style scoped src="./config-item-row.css" />
