<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

import ServerErrorView from '@/core/views/ServerErrorView.vue'

const capturedError = ref<Error | null>(null)

onErrorCaptured((error: Error) => {
  capturedError.value = error
  // Return false to stop the error from propagating further
  return false
})
</script>

<template>
  <ServerErrorView v-if="capturedError" :error="capturedError" />
  <slot v-else />
</template>
