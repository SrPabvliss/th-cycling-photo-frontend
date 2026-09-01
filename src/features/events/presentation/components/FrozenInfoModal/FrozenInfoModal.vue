<script setup lang="ts">
import { NCard, NModal } from 'naive-ui'

import StateSlides from '../StateSlides/StateSlides.vue'
import { FROZEN_SLIDES } from '../StateSlides/frozen-slides.data'

defineProps<{
  show: boolean
}>()

defineEmits<{
  'update:show': [value: boolean]
}>()
</script>

<template>
  <NModal :show="show" @update:show="$emit('update:show', $event)">
    <NCard class="state-info" :bordered="false" role="dialog" aria-modal="true">
      <h2 class="state-info__title">Este evento está congelado</h2>
      <p class="state-info__subtitle">Esto es lo que cambia mientras dure.</p>

      <StateSlides class="state-info__carousel" :slides="FROZEN_SLIDES" />
    </NCard>
  </NModal>
</template>

<style scoped src="../StateSlides/state-info-modal.css" />
