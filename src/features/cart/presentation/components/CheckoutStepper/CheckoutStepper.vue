<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { CheckmarkCircle } from '@vicons/ionicons5'

import type { ICartGroup } from '../../../types/responses/cart.response'

defineProps<{
  groups: ICartGroup[]
  currentStep: number
  isStepComplete: (eventId: string) => boolean
}>()

const emit = defineEmits<{
  'tab-click': [index: number]
}>()
</script>

<template>
  <div v-if="groups.length > 1" class="step-bar">
    <button
      v-for="(group, idx) in groups"
      :key="group.eventId"
      class="step-tab"
      :class="{
        'step-tab--active': idx === currentStep,
        'step-tab--done': isStepComplete(group.eventId) && idx !== currentStep,
      }"
      @click="emit('tab-click', idx)"
    >
      <span class="step-tab__number">
        <NIcon
          v-if="isStepComplete(group.eventId) && idx !== currentStep"
          :component="CheckmarkCircle"
          :size="16"
        />
        <template v-else>{{ idx + 1 }}</template>
      </span>
      <span class="step-tab__label">{{ group.eventName }}</span>
      <span class="step-tab__count">{{ group.photos.length }} fotos</span>
    </button>
  </div>
</template>

<style scoped src="./checkout-stepper.css" />
