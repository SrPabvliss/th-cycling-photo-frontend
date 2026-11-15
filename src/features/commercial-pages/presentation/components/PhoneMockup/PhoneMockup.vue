<script setup lang="ts">
import type { PhoneBlock } from './phone-blocks'

// A phone drawn with blocks: decoration only, so the whole of it is hidden from screen readers.
defineProps<{ blocks: PhoneBlock[] }>()
</script>

<template>
  <div class="phone-mockup" data-test="phone" aria-hidden="true">
    <template v-for="(block, index) in blocks" :key="index">
      <div v-if="block.kind === 'grid'" class="phone-mockup__grid">
        <template v-for="cell in block.cells" :key="cell">
          <span
            v-if="cell - 1 === block.markAt"
            class="phone-mockup__mark phone-mockup__mark--cell"
          >
            {{ block.markText }}
          </span>
          <i v-else class="phone-mockup__cell" />
        </template>
      </div>
      <div
        v-else-if="block.kind === 'mark'"
        class="phone-mockup__mark"
        :class="`phone-mockup__mark--${block.shape}`"
      >
        {{ block.text }}
      </div>
      <div v-else-if="block.kind === 'field'" class="phone-mockup__field">{{ block.text }}</div>
      <div v-else :class="`phone-mockup__${block.kind}`" />
    </template>
  </div>
</template>

<style scoped>
.phone-mockup {
  display: flex;
  flex-direction: column;
  gap: calc(var(--tt-space-2) - var(--tt-space-1) / 4);
  inline-size: 100%;
  max-inline-size: calc(var(--tt-space-8) * 3 + var(--tt-space-5) + var(--tt-space-1));
  aspect-ratio: 9 / 16;
  margin: calc(var(--tt-space-1) + var(--tt-space-1) / 4) auto;
  padding: var(--tt-space-3) calc(var(--tt-space-2) + var(--tt-space-1) / 2)
    calc(var(--tt-space-2) + var(--tt-space-1) / 2);
  overflow: hidden;
  border-radius: calc(var(--tt-radius-xl) + var(--tt-space-1) / 2);
  background: var(--tt-surface);
  box-shadow:
    0 0 0 calc(var(--tt-space-1) + var(--tt-space-1) / 4) var(--tt-line),
    var(--tt-shadow-2);
}

.phone-mockup__bar {
  flex: none;
  inline-size: 46%;
  block-size: var(--tt-space-2);
  border-radius: var(--tt-space-1);
  background: var(--tt-line);
}

.phone-mockup__row,
.phone-mockup__big,
.phone-mockup__cell {
  background: var(--tt-surface-sunken);
  box-shadow: inset 0 0 0 1px var(--tt-line-subtle);
}

.phone-mockup__row {
  flex: none;
  block-size: calc(var(--tt-space-6) + var(--tt-space-1) / 2);
  border-radius: var(--tt-radius-s);
}

.phone-mockup__big {
  flex: 1;
  min-block-size: 0;
  border-radius: var(--tt-radius-s);
}

.phone-mockup__grid {
  flex: none;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: calc(var(--tt-space-1) + var(--tt-space-1) / 4);
}

.phone-mockup__cell {
  display: block;
  aspect-ratio: 3 / 4;
  border-radius: calc(var(--tt-space-1) + var(--tt-space-1) / 4);
}

.phone-mockup__field {
  flex: none;
  display: flex;
  align-items: center;
  block-size: calc(var(--tt-space-5) + var(--tt-space-1) / 2);
  padding-inline: var(--tt-space-2);
  overflow: hidden;
  border-radius: calc(var(--tt-radius-s) - var(--tt-space-1) / 4);
  background: var(--tt-primary-soft);
  box-shadow: inset 0 0 0 1px var(--tt-primary-soft-border);
  color: var(--tt-primary-ink);
  font-size: calc(var(--tt-space-2) + var(--tt-space-1) / 2);
  font-weight: var(--tt-type-eyebrow-weight);
  white-space: nowrap;
}

.phone-mockup__mark {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--tt-space-1) / 2);
  border-radius: calc(var(--tt-radius-s) - var(--tt-space-1) / 2);
  background: var(--tt-spot);
  color: var(--tt-on-spot);
  font-family: var(--tt-font-display);
  font-stretch: var(--tt-number-stretch);
  font-size: calc(var(--tt-space-2) + var(--tt-space-1) / 4);
  font-weight: var(--tt-type-display-m-weight);
  line-height: 1.2;
  letter-spacing: 0.04em;
  text-align: center;
  text-transform: uppercase;
}

.phone-mockup__mark--band {
  aspect-ratio: 2 / 1;
}

.phone-mockup__mark--strip {
  block-size: calc(var(--tt-space-5) - var(--tt-space-1) / 2);
}

.phone-mockup__mark--wide {
  aspect-ratio: 32 / 5;
  font-size: var(--tt-space-2);
}

.phone-mockup__mark--cell {
  aspect-ratio: 3 / 4;
}
</style>
