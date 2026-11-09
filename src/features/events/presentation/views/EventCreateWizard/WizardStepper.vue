<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { CheckmarkOutline, ChevronBackOutline, CloseOutline } from '@vicons/ionicons5'

import type { IWizardStep } from '../../../types/event-wizard.types'

const props = withDefaults(
  defineProps<{
    steps: IWizardStep[]
    currentIndex: number
    variant?: 'rail' | 'mobile'
  }>(),
  { variant: 'rail' },
)

const emit = defineEmits<{
  back: []
  exit: []
}>()

function stepState(index: number): 'done' | 'now' | 'next' {
  if (index < props.currentIndex) return 'done'
  if (index === props.currentIndex) return 'now'
  return 'next'
}

const activeStep = computed<IWizardStep | undefined>(() => props.steps[props.currentIndex])
</script>

<template>
  <ol v-if="variant === 'rail'" class="ce-steps">
    <li v-for="(step, index) in steps" :key="step.id" class="ce-step" :class="stepState(index)">
      <span class="ce-step-n">
        <NIcon v-if="stepState(index) === 'done'" :component="CheckmarkOutline" :size="13" />
        <template v-else>{{ index + 1 }}</template>
      </span>
      <span class="ce-step-t">
        <b>{{ step.label }}</b>
        <i>{{ step.hint }}</i>
      </span>
    </li>
  </ol>

  <div v-else class="ce-msteps">
    <div class="ce-msteps-top">
      <NButton v-if="currentIndex > 0" circle aria-label="Paso anterior" @click="emit('back')">
        <template #icon><NIcon :component="ChevronBackOutline" /></template>
      </NButton>
      <NButton v-else circle quaternary aria-label="Salir" @click="emit('exit')">
        <template #icon><NIcon :component="CloseOutline" /></template>
      </NButton>
      <div v-if="activeStep" class="ce-msteps-t">
        <b>{{ activeStep.label }}</b>
        <span>Paso {{ currentIndex + 1 }} de {{ steps.length }} · {{ activeStep.hint }}</span>
      </div>
    </div>
    <div class="ce-mbar">
      <i v-for="(step, index) in steps" :key="step.id" :class="{ on: index <= currentIndex }" />
    </div>
  </div>
</template>

<style scoped src="./wizard-stepper.css" />
