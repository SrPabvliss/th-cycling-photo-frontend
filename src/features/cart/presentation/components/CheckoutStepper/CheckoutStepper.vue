<script setup lang="ts">
import { computed } from 'vue'

import type { ICartGroup } from '../../../types/responses/cart.response'

const props = defineProps<{
  groups: ICartGroup[]
  currentStep: number
  isStepComplete: (eventId: string) => boolean
  showReview: boolean
}>()

const emit = defineEmits<{
  'tab-click': [index: number]
}>()

const isCompact = computed(() => props.groups.length > 4)
const allEventsComplete = computed(() => props.groups.every((g) => props.isStepComplete(g.eventId)))
const activeGroup = computed(() => (props.showReview ? null : props.groups[props.currentStep]))

function nodeClass(idx: number) {
  const eventId = props.groups[idx]?.eventId
  if (!eventId) return 'disabled'
  if (props.showReview) {
    return props.isStepComplete(eventId) ? 'done' : 'invalid'
  }
  if (idx === props.currentStep) return 'active'
  if (props.isStepComplete(eventId)) return 'done'
  if (idx < props.currentStep) return 'invalid'
  return 'disabled'
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}
</script>

<template>
  <div v-if="groups.length > 0" class="stepper" :class="{ compact: isCompact }">
    <!-- ── Normal variant (≤4 events) ── -->
    <template v-if="!isCompact">
      <!-- Event nodes -->
      <button
        v-for="(group, idx) in groups"
        :key="group.eventId"
        class="step-node"
        :class="nodeClass(idx)"
        :disabled="nodeClass(idx) === 'disabled'"
        @click="emit('tab-click', idx)"
      >
        <div class="step-num">
          <svg
            v-if="isStepComplete(group.eventId) && (showReview || idx !== currentStep)"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <template v-else>{{ pad(idx + 1) }}</template>
        </div>
        <div class="step-body">
          <div class="step-kind">Evento {{ idx + 1 }} de {{ groups.length }}</div>
          <div class="step-title">{{ group.eventName }}</div>
          <div
            class="step-hint"
            :class="{
              ok: isStepComplete(group.eventId),
              warn: !isStepComplete(group.eventId) && (showReview || idx < currentStep),
            }"
          >
            <template v-if="isStepComplete(group.eventId)">
              {{ group.photos.length }} foto{{ group.photos.length === 1 ? '' : 's' }} · completo
            </template>
            <template v-else-if="showReview || idx < currentStep">Falta info</template>
            <template v-else>
              {{ group.photos.length }} foto{{ group.photos.length === 1 ? '' : 's' }}
            </template>
          </div>
        </div>
      </button>

      <!-- Review node -->
      <button
        class="step-node"
        :class="showReview ? 'active' : allEventsComplete ? '' : 'disabled'"
        :disabled="!showReview && !allEventsComplete"
        @click="emit('tab-click', groups.length)"
      >
        <div class="step-num">{{ pad(groups.length + 1) }}</div>
        <div class="step-body">
          <div class="step-kind">Último paso</div>
          <div class="step-title">Revisar y enviar</div>
          <div class="step-hint">
            {{ allEventsComplete ? 'Confirma el pedido' : 'Completa los eventos primero' }}
          </div>
        </div>
      </button>
    </template>

    <!-- ── Compact variant (>4 events) ── -->
    <template v-else>
      <!-- Event dots -->
      <template v-for="(group, idx) in groups" :key="group.eventId">
        <button
          class="step-dot"
          :class="nodeClass(idx)"
          :disabled="nodeClass(idx) === 'disabled'"
          @click="emit('tab-click', idx)"
        >
          <svg
            v-if="isStepComplete(group.eventId) && (showReview || idx !== currentStep)"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <template v-else>{{ pad(idx + 1) }}</template>
        </button>
        <div class="step-link" />
      </template>

      <!-- Review dot -->
      <button
        class="step-dot"
        :class="showReview ? 'active' : allEventsComplete ? '' : 'disabled'"
        :disabled="!showReview && !allEventsComplete"
        @click="emit('tab-click', groups.length)"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>

      <!-- Active label -->
      <div class="active-label">
        <div class="kind">
          {{ showReview ? 'Último paso' : `Evento ${currentStep + 1} de ${groups.length}` }}
        </div>
        <div class="ttl">
          {{ showReview ? 'Revisar y enviar' : activeGroup?.eventName }}
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped src="./checkout-stepper.css" />
