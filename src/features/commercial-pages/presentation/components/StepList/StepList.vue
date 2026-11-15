<script setup lang="ts">
import PhoneMockup from '../PhoneMockup/PhoneMockup.vue'
import type { PhoneBlock } from '../PhoneMockup/phone-blocks'

export interface ICommercialStep {
  title: string
  text: string
  /** A phone drawn above the step; phones go away below 520 px and the steps become a list. */
  phone?: PhoneBlock[]
}

defineProps<{ steps: ICommercialStep[] }>()
</script>

<template>
  <ol class="step-list" :style="{ '--step-columns': steps.length }">
    <li v-for="step in steps" :key="step.title" class="step-list__step">
      <PhoneMockup v-if="step.phone" class="step-list__phone" :blocks="step.phone" />
      <h3 class="step-list__title">{{ step.title }}</h3>
      <p class="step-list__text">{{ step.text }}</p>
    </li>
  </ol>
</template>

<style scoped>
.step-list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--tt-space-5);
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: step;
}

/* Phones: the number, title and text side by side, without the drawing. */
.step-list__step {
  display: grid;
  grid-template-columns: calc(var(--tt-space-6) + var(--tt-space-1)) minmax(0, 1fr);
  column-gap: calc(var(--tt-space-3) + var(--tt-space-1) / 2);
  row-gap: var(--tt-space-1);
  align-items: start;
  min-inline-size: 0;
  counter-increment: step;
}

.step-list__step::before {
  content: counter(step);
  grid-row: 1 / span 3;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: calc(var(--tt-space-6) + var(--tt-space-1));
  block-size: calc(var(--tt-space-6) + var(--tt-space-1));
  border-radius: var(--tt-radius-pill);
  background: var(--tt-primary);
  color: var(--tt-on-primary);
  font-family: var(--tt-font-display);
  font-size: calc(var(--tt-type-title-size) + 1px);
  font-weight: var(--tt-type-display-m-weight);
}

.step-list__phone {
  display: none;
}

.step-list__title {
  display: flex;
  align-items: center;
  min-block-size: calc(var(--tt-space-6) + var(--tt-space-1));
  margin: 0;
  font-size: calc(var(--tt-type-title-size) + 1px);
  line-height: var(--tt-type-title-line);
  font-weight: var(--tt-type-eyebrow-weight);
}

.step-list__text {
  grid-column: 2;
  margin: 0;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-size);
  line-height: var(--tt-type-body-line);
}

@media (min-width: 521px) {
  .step-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .step-list__step {
    display: flex;
    flex-direction: column;
    gap: var(--tt-space-2);
  }

  .step-list__phone {
    display: flex;
    max-inline-size: calc(var(--tt-space-8) * 2 + var(--tt-space-7) + var(--tt-space-1));
    margin: var(--tt-space-2) 0 var(--tt-space-1);
  }

  .step-list__title {
    min-block-size: 0;
  }
}

@media (min-width: 901px) {
  .step-list {
    grid-template-columns: repeat(var(--step-columns), minmax(0, 1fr));
  }
}
</style>
