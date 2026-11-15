<script setup lang="ts">
import { NButton } from 'naive-ui'

// The close of the library's card modals is named "close", in English and fixed. Modals that
// people outside the panel see turn it off (closable false) and put this one in the header.
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <NButton quaternary circle size="small" aria-label="Cerrar" @click="emit('close')">
    <template #icon>
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor">
        <path d="M6 6l12 12M18 6 6 18" stroke-width="2" stroke-linecap="round" />
      </svg>
    </template>
  </NButton>
</template>
