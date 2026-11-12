<script setup lang="ts">
import { ref, onErrorCaptured, watch } from 'vue'
import { useRoute } from 'vue-router'
import { isAxiosError } from 'axios'

import ServerErrorView from '@/core/views/ServerErrorView.vue'

const route = useRoute()
const capturedError = ref<Error | null>(null)

function recover() {
  capturedError.value = null
}

onErrorCaptured((error: Error) => {
  // Axios errors are already handled by the error interceptor (toast shown).
  // Only capture non-HTTP errors as truly unexpected (500 page).
  if (isAxiosError(error)) return false

  capturedError.value = error
  return false
})

// Leaving the screen that failed is a way out: the next one gets its chance to render.
watch(() => route.fullPath, recover)
</script>

<template>
  <!-- Clearing the error mounts the content from scratch, which is what retrying means here. -->
  <ServerErrorView v-if="capturedError" :error="capturedError" recoverable @retry="recover" />
  <slot v-else />
</template>
