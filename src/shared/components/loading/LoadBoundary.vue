<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { problemKind } from '@/core/http/problem-kind'
import ErrorState from './ErrorState.vue'
import { useLoadPhase } from './use-load-phase'

const props = withDefaults(
  defineProps<{
    /** Same values as the `status` of a vue-query query: pass it straight through. */
    status: 'pending' | 'error' | 'success'
    /** What loads, with its article: "los eventos", "tus compras", "tu pedido". */
    what: string
    /** The query's `error`: its cause picks the words and the drawing. */
    error?: unknown
    /** The error is all the screen has: a centred column (see `ErrorState`). */
    stacked?: boolean
    /** The load worked and there is nothing to show. */
    empty?: boolean
    /** A new request is running over something already on screen (`isFetching`). */
    refreshing?: boolean
    errorTitle?: string
    errorText?: string
  }>(),
  { empty: false, refreshing: false, error: undefined, stacked: false },
)

const emit = defineEmits<{
  retry: []
}>()

// Without network vue-query pauses a load instead of failing it: that wait is said in place,
// never painted as a skeleton that does not end.
const { isPending, showSkeleton, isWaitingForNetwork: isOffline } = useLoadPhase(() => props.status)

const kind = computed(() => (isOffline.value ? 'offline' : problemKind(props.error)))

// A stacked error is all the screen has: it keeps the height of what was painted before it (the
// skeleton, mostly), so the page does not shrink under the person. Compact and wide errors take
// only their own height: stretched, they read as an empty box. Read before the error replaces it.
const root = ref<HTMLElement | null>(null)
const heldHeight = ref(0)
const showsProblem = computed(() => props.status === 'error' || isOffline.value)
watch(
  showsProblem,
  (now, before) => {
    if (now && !before) heldHeight.value = root.value?.offsetHeight ?? 0
  },
  { flush: 'pre' },
)
const errorStyle = computed(() =>
  props.stacked && heldHeight.value > 0
    ? { '--load-boundary-held': `${heldHeight.value}px` }
    : undefined,
)

const isBusy = computed(
  () => isPending.value || showSkeleton.value || (props.status === 'success' && props.refreshing),
)
</script>

<template>
  <div ref="root" class="load-boundary" :aria-busy="isBusy ? 'true' : undefined">
    <slot v-if="showSkeleton" name="skeleton" />

    <template v-else-if="isPending" />

    <ErrorState
      v-else-if="showsProblem"
      :what="what"
      :kind="kind"
      :stacked="stacked"
      :style="errorStyle"
      :title="errorTitle"
      :text="errorText"
      :retrying="refreshing"
      @retry="emit('retry')"
    />

    <slot v-else-if="empty" name="empty" />

    <div
      v-else
      class="load-boundary__content"
      :class="{ 'load-boundary__content--refreshing': refreshing }"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.load-boundary__content {
  transition: opacity var(--tt-motion-base) var(--tt-easing-standard);
}

/* A long skeleton (a list of cards on a phone) would push the message below the fold: the held
   height stops at most of a screen. What is taller than that was out of sight anyway. Without a
   held height the declaration is dropped and the error takes its own height. */
.load-boundary :deep(.error-state--stacked) {
  min-block-size: min(var(--load-boundary-held), 60dvh);
}

.load-boundary__content--refreshing {
  opacity: 0.55;
}

@media (prefers-reduced-motion: reduce) {
  .load-boundary__content {
    transition: none;
  }
}
</style>
