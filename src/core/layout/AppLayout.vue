<script setup lang="ts">
import { useNotificationSocket } from '@/features/notifications/composables/use-notification-socket'
import AppNav from './AppNav.vue'

useNotificationSocket()
</script>

<template>
  <div class="app-layout">
    <AppNav />
    <main class="app-layout-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped src="./styles/app-layout.css" />
