<script setup lang="ts">
import { computed } from 'vue'

import ErrorState from './ErrorState.vue'
import { useDelayedFlag } from './use-delayed-flag'

const props = withDefaults(
  defineProps<{
    /** Same values as the `status` of a vue-query query: pass it straight through. */
    status: 'pending' | 'error' | 'success'
    /** The load worked and there is nothing to show. */
    empty?: boolean
    /** A new request is running over something already on screen (`isFetching`). */
    refreshing?: boolean
    errorTitle?: string
    errorText?: string
  }>(),
  { empty: false, refreshing: false },
)

const emit = defineEmits<{
  retry: []
}>()

const isPending = computed(() => props.status === 'pending')
const showSkeleton = useDelayedFlag(isPending)

const isBusy = computed(
  () => isPending.value || showSkeleton.value || (props.status === 'success' && props.refreshing),
)
</script>

<template>
  <div class="load-boundary" :aria-busy="isBusy ? 'true' : undefined">
    <slot v-if="showSkeleton" name="skeleton" />

    <template v-else-if="isPending" />

    <ErrorState
      v-else-if="status === 'error'"
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
