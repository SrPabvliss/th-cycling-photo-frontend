<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider, dateEsAR, esAR } from 'naive-ui'

import ErrorBoundary from '@/core/layout/ErrorBoundary.vue'
import ConsentReacceptModal from '@/features/auth/presentation/components/ConsentReacceptModal/ConsentReacceptModal.vue'
import VerifyEmailPrompt from '@/features/account/presentation/components/VerifyEmailPrompt/VerifyEmailPrompt.vue'
import PersonalProfilePrompt from '@/features/account/presentation/components/PersonalProfilePrompt/PersonalProfilePrompt.vue'
import NotificationSocketProvider from '@/features/notifications/presentation/components/NotificationSocketProvider/NotificationSocketProvider.vue'
import { naiveConfig } from '@/core/theme/naive-theme'
import { MESSAGE_CONTAINER_STYLE } from '@/core/ui/discrete-api'
</script>

<template>
  <NConfigProvider
    :theme="naiveConfig.theme"
    :theme-overrides="naiveConfig.themeOverrides"
    :locale="esAR"
    :date-locale="dateEsAR"
  >
    <NMessageProvider :container-style="MESSAGE_CONTAINER_STYLE">
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
