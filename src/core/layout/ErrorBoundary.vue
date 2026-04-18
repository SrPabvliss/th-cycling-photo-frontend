<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { isAxiosError } from 'axios'

import ServerErrorView from '@/core/views/ServerErrorView.vue'

const capturedError = ref<Error | null>(null)

onErrorCaptured((error: Error) => {
  // Axios errors are already handled by the error interceptor (toast shown).
  // Only capture non-HTTP errors as truly unexpected (500 page).
  if (isAxiosError(error)) return false

  capturedError.value = error
  return false
})
</script>

<template>
  <ServerErrorView v-if="capturedError" :error="capturedError" />
  <slot v-else />
</template>
