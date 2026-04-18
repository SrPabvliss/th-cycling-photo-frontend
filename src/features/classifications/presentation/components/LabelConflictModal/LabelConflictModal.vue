<script setup lang="ts">
import { NButton, NModal, NTag } from 'naive-ui'

import type { ILabelSet } from '../../../composables/use-label-conflict'

defineProps<{
  show: boolean
  mode: 'inherit' | 'conflict'
  incomingLabels: ILabelSet | null
  existingLabels: ILabelSet | null
  photoFilename?: string
}>()

defineEmits<{
  'update:show': [value: boolean]
  inherit: [accept: boolean]
  conflict: [winner: 'existing' | 'incoming']
}>()

function formatIdentifier(identifier: string | null): string {
  return identifier ? `#${identifier}` : 'Sin dorsal'
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="mode === 'inherit' ? 'Heredar clasificaciones' : 'Conflicto de clasificaciones'"
    style="max-width: 500px"
    :mask-closable="false"
    @update:show="$emit('update:show', $event)"
  >
    <!-- Inherit mode -->
    <div v-if="mode === 'inherit' && incomingLabels" class="label-conflict-modal">
      <p class="label-conflict-modal__description">
        La foto <strong>{{ photoFilename }}</strong> ya tiene clasificaciones.
        {{
          incomingLabels.identifier ? `Dorsal ${formatIdentifier(incomingLabels.identifier)}.` : ''
        }}
      </p>
      <p class="label-conflict-modal__question">
        Aplicar estos datos al formulario de clasificacion grupal?
      </p>
      <div class="label-conflict-modal__actions">
        <NButton @click="$emit('inherit', false)">No, descartar</NButton>
        <NButton type="primary" @click="$emit('inherit', true)">Aplicar</NButton>
      </div>
    </div>

    <!-- Conflict mode -->
    <div
      v-else-if="mode === 'conflict' && existingLabels && incomingLabels"
      class="label-conflict-modal"
    >
      <p class="label-conflict-modal__description">
        Las clasificaciones de esta foto difieren de las del grupo actual.
      </p>

      <div class="label-conflict-modal__comparison">
        <div class="label-conflict-modal__side">
          <p class="label-conflict-modal__side-title">Grupo actual</p>
          <NTag size="small" :bordered="false">{{
            formatIdentifier(existingLabels.identifier)
          }}</NTag>
        </div>
        <div class="label-conflict-modal__side">
          <p class="label-conflict-modal__side-title">Foto nueva</p>
          <NTag size="small" :bordered="false">{{
            formatIdentifier(incomingLabels.identifier)
          }}</NTag>
        </div>
      </div>

      <div class="label-conflict-modal__actions">
        <NButton @click="$emit('conflict', 'existing')">Mantener grupo actual</NButton>
        <NButton type="primary" @click="$emit('conflict', 'incoming')">Usar foto nueva</NButton>
      </div>
    </div>
  </NModal>
</template>

<style scoped src="./label-conflict-modal.css" />
