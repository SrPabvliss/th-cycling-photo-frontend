<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider, dateEsAR, esAR } from 'naive-ui'

import ErrorBoundary from '@/core/layout/ErrorBoundary.vue'
import ConsentReacceptModal from '@/features/auth/presentation/components/ConsentReacceptModal/ConsentReacceptModal.vue'
import VerifyEmailPrompt from '@/features/account/presentation/components/VerifyEmailPrompt/VerifyEmailPrompt.vue'
import PersonalProfilePrompt from '@/features/account/presentation/components/PersonalProfilePrompt/PersonalProfilePrompt.vue'
import NotificationSocketProvider from '@/features/notifications/presentation/components/NotificationSocketProvider/NotificationSocketProvider.vue'
import { titanTvTheme } from '@/core/theme/titan-tv-theme'
</script>

<template>
  <NConfigProvider :theme-overrides="titanTvTheme" :locale="esAR" :date-locale="dateEsAR">
    <NMessageProvider>
      <NDialogProvider>
        <ErrorBoundary>
          <NotificationSocketProvider />
          <RouterView />
          <ConsentReacceptModal />
          <VerifyEmailPrompt />
          <PersonalProfilePrompt />
        </ErrorBoundary>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>
