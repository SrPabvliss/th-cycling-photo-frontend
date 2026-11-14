<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton } from 'naive-ui'

import type { ProblemKind } from '@/core/http/problem-kind'
import { useScreenProblem } from '@/core/layout/client/screen-problem'
import { useOnline } from '@/core/network/use-online'
import { ILLUSTRATION_VIEW_BOX, ILLUSTRATIONS } from '@/shared/components/empty-state/illustrations'
import { problemCopy } from './problem-copy'

// A list, grid or block that did not load, in the place of its content while the rest of the
// screen goes on. Words and drawing come from the cause. `title` and `text` say it better than
// "No pudimos mostrar…" when the cause is the server or unknown; no network, slowness, too many
// tries and a closed session keep their own words.
const props = withDefaults(
  defineProps<{
    /** What did not show, with its article: "los eventos", "tus compras", "tu pedido". */
    what: string
    kind?: ProblemKind
    title?: string
    text?: string
    /** A centred column with a larger drawing, for when this section is all the screen has. */
    stacked?: boolean
    /** A retry is on its way: the button shows it and takes no more presses. */
    retrying?: boolean
  }>(),
  { kind: 'unknown', stacked: false, retrying: false },
)

const emit = defineEmits<{
  retry: []
}>()

// Once the network is gone that is the problem, whatever the load failed with before.
const online = useOnline()
const kind = computed<ProblemKind>(() => (online.value ? props.kind : 'offline'))
const copy = computed(() => problemCopy(kind.value, props.what))
const canSayBetter = computed(() => kind.value === 'server' || kind.value === 'unknown')
const shownTitle = computed(() => (canSayBetter.value && props.title) || copy.value.title)
const shownText = computed(() => (canSayBetter.value && props.text) || copy.value.text)
const drawing = computed(() =>
  copy.value.illustration ? ILLUSTRATIONS[copy.value.illustration] : null,
)
// Without network there is nothing to press: it comes back on its own.
const isWaiting = computed(() => kind.value === 'offline')

const root = ref<HTMLElement | null>(null)
useScreenProblem(root)
</script>

<template>
  <div
    ref="root"
    class="error-state"
    :class="{ 'error-state--stacked': stacked }"
    :role="isWaiting ? 'status' : 'alert'"
  >
    <div class="error-state__box">
      <!-- Markup generated from the design files by scripts/sync-illustrations.mjs, never user data. -->
      <!-- eslint-disable vue/no-v-html -->
      <svg
        v-if="drawing"
        class="error-state__illustration"
        :data-illustration="copy.illustration"
        :viewBox="ILLUSTRATION_VIEW_BOX"
        fill="none"
        aria-hidden="true"
        v-html="drawing"
      />
      <!-- eslint-enable vue/no-v-html -->
      <div class="error-state__words">
        <p class="error-state__title">{{ shownTitle }}</p>
        <p class="error-state__text">{{ shownText }}</p>
      </div>
      <NButton
        v-if="copy.retry"
        class="error-state__retry"
        type="primary"
        :size="stacked ? 'medium' : 'small'"
        :loading="retrying"
        :disabled="retrying"
        @click="emit('retry')"
      >
        Reintentar
      </NButton>
    </div>
  </div>
</template>

<style scoped>
/* Drawing sizes: compact, wide, stacked. Candidates for awana tokens. */
.error-state {
  --error-state-ilu-compact: calc(var(--tt-ilu-inline) * 0.6);
  --error-state-ilu-wide: calc(var(--tt-ilu-inline) * 0.7);
  --error-state-ilu-stacked: calc(var(--tt-ilu-inline) * 0.875);

  container-type: inline-size;
  display: flex;
  inline-size: 100%;
}

/* Compact: drawing on the left; title, detail and a small button under the words. */
.error-state__box {
  --error-state-ilu: var(--error-state-ilu-compact);

  display: grid;
  flex: 1;
  grid-template-columns: auto minmax(0, 1fr);
  align-content: center;
  align-items: center;
  column-gap: var(--tt-space-3);
  padding: var(--tt-space-3) var(--tt-space-4) var(--tt-space-3) var(--tt-space-3);
  border-radius: var(--tt-radius-l);
  background: var(--tt-surface-sunken);
  color: var(--tt-ink);
  font-family: var(--tt-font-sans);
}

.error-state__illustration {
  grid-row: span 2;
  flex: none;
  inline-size: var(--error-state-ilu);
  aspect-ratio: 160 / 128;
}

.error-state__words {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-1);
  min-inline-size: 0;
  align-self: end;
}

.error-state__title,
.error-state__text {
  margin: 0;
}

.error-state__title {
  font-size: var(--tt-type-body-size);
  line-height: var(--tt-type-body-s-line);
  font-weight: var(--tt-type-title-weight);
  text-wrap: balance;
}

.error-state__text {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
  font-weight: var(--tt-type-caption-weight);
}

.error-state__retry {
  grid-column: 2;
  justify-self: start;
  align-self: start;
  margin-block-start: var(--tt-space-2);
}

/* Without a button the words centre beside the drawing. */
.error-state__words:last-child {
  grid-row: span 2;
  align-self: center;
}

/* Desktop-wide container: drawing, words, then the button on the right, all centred on one line.
 * Container queries cannot read custom properties, so the breakpoint is written out: desktop
 * starts at 768, as in the rest of the app. */
@container (min-width: 768px) {
  .error-state:not(.error-state--stacked) .error-state__box {
    --error-state-ilu: var(--error-state-ilu-wide);

    grid-template-columns: auto minmax(0, 1fr) auto;
    column-gap: var(--tt-space-5);
    padding: var(--tt-space-4) var(--tt-space-5);
  }

  .error-state:not(.error-state--stacked) .error-state__illustration,
  .error-state:not(.error-state--stacked) .error-state__words {
    grid-row: auto;
    align-self: center;
  }

  .error-state:not(.error-state--stacked) .error-state__retry {
    grid-column: 3;
    align-self: center;
    margin: 0;
  }
}

/* Stacked: a centred column with a larger drawing. */
.error-state--stacked .error-state__box {
  --error-state-ilu: var(--error-state-ilu-stacked);

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--tt-space-2);
  padding: var(--tt-space-5) var(--tt-space-4);
  text-align: center;
}

.error-state--stacked .error-state__words {
  align-items: center;
  align-self: center;
}

.error-state--stacked .error-state__title {
  font-size: var(--tt-type-title-size);
  line-height: var(--tt-type-title-line);
}

.error-state--stacked .error-state__text {
  max-inline-size: calc(var(--tt-ilu-inline) * 2);
  font-size: var(--tt-type-body-s-size);
  line-height: var(--tt-type-body-s-line);
  font-weight: var(--tt-type-body-s-weight);
}

.error-state--stacked .error-state__retry {
  align-self: center;
}
</style>
