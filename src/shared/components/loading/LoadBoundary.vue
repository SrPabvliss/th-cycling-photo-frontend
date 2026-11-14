<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { problemKind } from '@/core/http/problem-kind'
import ErrorState from './ErrorState.vue'
import { useDelayedFlag } from './use-delayed-flag'

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

const isPending = computed(() => props.status === 'pending')
const showSkeleton = useDelayedFlag(isPending)

const kind = computed(() => problemKind(props.error))

// What was painted before the error (the skeleton, mostly) keeps its height, so the error takes
// its place without the page jumping. Read before the error replaces it.
const root = ref<HTMLElement | null>(null)
const heldHeight = ref(0)
watch(
  () => props.status,
  (status, previous) => {
    if (status === 'error' && previous !== 'error') heldHeight.value = root.value?.offsetHeight ?? 0
  },
  { flush: 'pre' },
)
const errorStyle = computed(() =>
  heldHeight.value > 0 ? { minBlockSize: `${heldHeight.value}px` } : undefined,
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
      v-else-if="status === 'error'"
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

.load-boundary__content--refreshing {
  opacity: 0.55;
}

@media (prefers-reduced-motion: reduce) {
  .load-boundary__content {
    transition: none;
  }
}
</style>
