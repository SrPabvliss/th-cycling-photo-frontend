<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider } from 'naive-ui'

import { titanTvTheme } from '@/core/theme/titan-tv-theme'
</script>

<template>
  <NConfigProvider :theme-overrides="titanTvTheme">
    <NMessageProvider>
      <NDialogProvider>
        <RouterView />
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>
