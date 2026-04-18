<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider } from 'naive-ui'

import ErrorBoundary from '@/core/layout/ErrorBoundary.vue'
import { titanTvTheme } from '@/core/theme/titan-tv-theme'
</script>

<template>
  <NConfigProvider :theme-overrides="titanTvTheme">
    <NMessageProvider>
      <NDialogProvider>
        <ErrorBoundary>
          <RouterView />
        </ErrorBoundary>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>
