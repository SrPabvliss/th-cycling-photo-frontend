<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider, dateEsAR, esAR } from 'naive-ui'

import ErrorBoundary from '@/core/layout/ErrorBoundary.vue'
import { titanTvTheme } from '@/core/theme/titan-tv-theme'
</script>

<template>
  <NConfigProvider :theme-overrides="titanTvTheme" :locale="esAR" :date-locale="dateEsAR">
    <NMessageProvider>
      <NDialogProvider>
        <ErrorBoundary>
          <RouterView />
        </ErrorBoundary>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>
