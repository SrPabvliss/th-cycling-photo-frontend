<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'

import type { IBrandScreen } from '../../../constants/brand-screens'
import PhoneMockup from '../PhoneMockup/PhoneMockup.vue'

/** How long each group stays before the next one comes in on its own. */
const AUTO_MS = 5000

// The screens that carry a house ad, three at a time. Every group sits in the same cell, the
// hidden ones too, so the section keeps the height of the tallest group whichever is on screen:
// nothing below moves, nor do the arrows and marks. It moves on its own until someone touches
// it; never with the tab hidden or with reduced motion.
const props = defineProps<{ groups: IBrandScreen[][] }>()

const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const active = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

function show(index: number) {
  active.value = (index + props.groups.length) % props.groups.length
}

function stopMoving() {
  clearInterval(timer)
  timer = undefined
}

function choose(index: number) {
  stopMoving()
  show(index)
}

onMounted(() => {
  if (reducedMotion.value) return
  timer = setInterval(() => {
    if (!document.hidden) show(active.value + 1)
  }, AUTO_MS)
})
onBeforeUnmount(stopMoving)

const markLabel = (group: IBrandScreen[]) => `Ver ${group.map((screen) => screen.name).join(', ')}`
</script>

<template>
  <div class="screen-carousel">
    <div class="screen-carousel__track">
      <button
        type="button"
        class="screen-carousel__arrow screen-carousel__arrow--previous"
        aria-label="Anteriores"
        @click="choose(active - 1)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </button>

      <div class="screen-carousel__stage">
        <ul
          v-for="(group, index) in groups"
          :key="index"
          class="screen-carousel__group"
          :class="{ 'screen-carousel__group--hidden': index !== active }"
          :aria-hidden="index !== active ? 'true' : undefined"
          :inert="index !== active || undefined"
        >
          <li v-for="screen in group" :key="screen.name" class="screen-carousel__screen">
            <PhoneMockup :blocks="screen.phone" />
            <div class="screen-carousel__text">
              <h3 class="screen-carousel__name">{{ screen.name }}</h3>
              <p class="screen-carousel__where">{{ screen.text }}</p>
            </div>
          </li>
        </ul>
      </div>

      <button
        type="button"
        class="screen-carousel__arrow screen-carousel__arrow--next"
        aria-label="Siguientes"
        @click="choose(active + 1)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>

    <div class="screen-carousel__marks" role="group" aria-label="Más pantallas">
      <button
        v-for="(group, index) in groups"
        :key="index"
        type="button"
        class="screen-carousel__mark"
        :aria-pressed="index === active ? 'true' : 'false'"
        :aria-label="markLabel(group)"
        @click="choose(index)"
      />
    </div>
  </div>
</template>

<style scoped>
.screen-carousel {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-4);
}

.screen-carousel__track {
  display: flex;
  align-items: center;
  gap: var(--tt-space-3);
}

.screen-carousel__stage {
  display: grid;
  flex: 1;
  min-inline-size: 0;
}

/* Every group in the same cell: the stage is always as tall as the tallest one. */
.screen-carousel__group {
  grid-area: 1 / 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--tt-space-5);
  margin: 0;
  padding: 0;
  list-style: none;
  transition: opacity var(--tt-motion-base) var(--tt-easing-standard);
}

.screen-carousel__group--hidden {
  visibility: hidden;
  opacity: 0;
  transition:
    opacity var(--tt-motion-base) var(--tt-easing-standard),
    visibility 0s linear var(--tt-motion-base);
}

.screen-carousel__screen {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-3);
  min-inline-size: 0;
}

.screen-carousel__screen > :deep(.phone-mockup) {
  max-inline-size: calc(var(--tt-space-8) * 3 + var(--tt-space-6) + var(--tt-space-1) * 1.5);
}

.screen-carousel__text {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-1);
  text-align: center;
}

.screen-carousel__name {
  margin: 0;
  font-size: calc(var(--tt-type-title-size) + 1px);
  line-height: var(--tt-type-title-line);
  font-weight: var(--tt-type-eyebrow-weight);
}

.screen-carousel__where {
  margin: 0;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-size);
  line-height: var(--tt-type-body-line);
}

.screen-carousel__arrow {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: calc(var(--tt-control-m) + var(--tt-space-1));
  block-size: calc(var(--tt-control-m) + var(--tt-space-1));
  padding: 0;
  border: 0;
  border-radius: var(--tt-radius-pill);
  background: var(--tt-surface);
  box-shadow:
    inset 0 0 0 1px var(--tt-line),
    var(--tt-shadow-2);
  color: var(--tt-ink);
  cursor: pointer;
}

.screen-carousel__arrow:hover {
  background: var(--tt-surface-sunken);
}

.screen-carousel__arrow svg {
  inline-size: var(--tt-icon-l);
  block-size: var(--tt-icon-l);
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.screen-carousel__marks {
  display: flex;
  justify-content: center;
  gap: var(--tt-space-1);
}

.screen-carousel__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--tt-control-m);
  block-size: calc(var(--tt-space-6) - var(--tt-space-1));
  padding: 0;
  border: 0;
  border-radius: var(--tt-radius-s);
  background: none;
  cursor: pointer;
}

.screen-carousel__mark::before {
  content: '';
  inline-size: calc(var(--tt-space-6) - var(--tt-space-1));
  block-size: calc(var(--tt-space-1) * 1.5);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-line);
}

.screen-carousel__mark[aria-pressed='true']::before {
  background: var(--tt-primary);
}

@media (prefers-reduced-motion: reduce) {
  .screen-carousel__group,
  .screen-carousel__group--hidden {
    transition: none;
  }
}

/* Phones: the three screens still in a row, at a third of the width each, with their words
 * centered below; the arrows go below the row, then the marks. */
@media (max-width: 700px) {
  .screen-carousel__track {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--tt-space-3) calc(var(--tt-space-3) + var(--tt-space-1) / 2);
  }

  .screen-carousel__stage {
    grid-column: 1 / -1;
    order: -1;
  }

  .screen-carousel__arrow--previous {
    justify-self: end;
  }

  .screen-carousel__arrow--next {
    justify-self: start;
  }

  .screen-carousel__group {
    gap: calc(var(--tt-space-2) + var(--tt-space-1) / 2);
  }

  .screen-carousel__screen {
    gap: var(--tt-space-2);
  }

  .screen-carousel__name {
    font-size: var(--tt-type-body-s-size);
    line-height: var(--tt-type-caption-line);
    overflow-wrap: break-word;
  }

  .screen-carousel__where {
    font-size: var(--tt-type-caption-size);
    line-height: var(--tt-type-caption-line);
    overflow-wrap: break-word;
  }

  .screen-carousel__screen > :deep(.phone-mockup) {
    inline-size: auto;
    max-inline-size: none;
    margin: var(--tt-space-1);
    padding: calc(var(--tt-space-2) + 1px) calc(var(--tt-space-2) - 1px)
      calc(var(--tt-space-2) - 1px);
    gap: var(--tt-space-1);
    border-radius: calc(var(--tt-radius-l) + var(--tt-space-1) / 2);
    box-shadow:
      0 0 0 var(--tt-space-1) var(--tt-line),
      var(--tt-shadow-2);
  }

  .screen-carousel__screen :deep(.phone-mockup__mark) {
    font-size: calc(var(--tt-space-1) * 1.5);
    line-height: var(--tt-space-2);
  }

  .screen-carousel__screen :deep(.phone-mockup__mark--strip) {
    block-size: var(--tt-space-3);
  }

  .screen-carousel__screen :deep(.phone-mockup__row) {
    block-size: var(--tt-space-4);
    border-radius: calc(var(--tt-space-1) + 1px);
  }

  .screen-carousel__screen :deep(.phone-mockup__field) {
    block-size: calc(var(--tt-space-3) + var(--tt-space-1) / 2);
    padding-inline: calc(var(--tt-space-1) + 1px);
    font-size: calc(var(--tt-space-1) * 1.5);
  }

  .screen-carousel__screen :deep(.phone-mockup__thumb) {
    inline-size: var(--tt-space-4);
    block-size: var(--tt-space-4);
    border-radius: var(--tt-space-1);
  }

  .screen-carousel__screen :deep(.phone-mockup__bar) {
    block-size: calc(var(--tt-space-1) + 1px);
  }

  .screen-carousel__screen :deep(.phone-mockup__grid) {
    gap: calc(var(--tt-space-1) / 2);
  }

  /* The piece in a photo cell, without spacing and with a little air on both sides: when «Tu
   * marca» does not fit with it, it goes on two lines. */
  .screen-carousel__screen :deep(.phone-mockup__mark--cell) {
    padding: 0 calc(var(--tt-space-1) / 2);
    font-stretch: 100%;
    letter-spacing: 0;
  }
}

/* Narrow phones: the strip says only «Tu marca», on one line, and the piece in a photo cell gets
 * a smaller letter so «marca» does not touch its edges. Labels are never cut. */
@media (max-width: 379px) {
  .screen-carousel__screen :deep(.phone-mockup__mark--strip) {
    white-space: nowrap;
  }

  .screen-carousel__screen :deep(.phone-mockup__mark--strip .phone-mockup__label) {
    display: none;
  }

  .screen-carousel__screen :deep(.phone-mockup__mark--strip .phone-mockup__label--short) {
    display: inline;
  }

  .screen-carousel__screen :deep(.phone-mockup__mark--cell) {
    font-size: calc(var(--tt-space-1) + 1px);
    line-height: calc(var(--tt-space-2) - 1px);
  }
}

/* The narrowest phones: less air between the screens and in their frames, for a wider phone. */
@media (max-width: 360px) {
  .screen-carousel__group {
    gap: calc(var(--tt-space-1) + var(--tt-space-1) / 2);
  }

  .screen-carousel__screen > :deep(.phone-mockup) {
    margin: calc(var(--tt-space-1) - 1px);
    padding: var(--tt-space-2) calc(var(--tt-space-1) + 1px) calc(var(--tt-space-1) + 1px);
    box-shadow:
      0 0 0 calc(var(--tt-space-1) - 1px) var(--tt-line),
      var(--tt-shadow-2);
  }
}
</style>
