<script setup lang="ts">
import { NIcon, NModal } from 'naive-ui'
import { CheckmarkCircleOutline } from '@vicons/ionicons5'

import { CREATING_STEPS } from '../../../../composables/use-event-creation-submit'

defineProps<{
  show: boolean
  step: number
}>()

function stateOf(index: number, current: number): 'ok' | 'now' | '' {
  if (index < current) return 'ok'
  if (index === current) return 'now'
  return ''
}
</script>

<template>
  <NModal :show="show" :mask-closable="false" :close-on-esc="false">
    <div class="ce-creating" role="dialog" aria-modal="true" data-test="creating-modal">
      <b>Creando el evento</b>
      <ul>
        <li
          v-for="(label, index) in CREATING_STEPS"
          :key="label"
          :class="stateOf(index, step)"
          data-test="creating-step"
        >
          <NIcon v-if="index < step" :component="CheckmarkCircleOutline" :size="15" />
          <i v-else-if="index === step" class="ce-spin" />
          <i v-else class="ce-dot" />
          {{ label }}
        </li>
      </ul>
      <span>No cierres esta ventana. Cada paso se guarda por separado.</span>
    </div>
  </NModal>
</template>

<style scoped src="./creating-modal.css" />
