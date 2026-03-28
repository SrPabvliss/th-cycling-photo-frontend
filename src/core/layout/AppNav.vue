<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NAvatar, NIcon } from 'naive-ui'
import { LogOutOutline } from '@vicons/ionicons5'

import { useAuth } from '@/features/auth/composables/use-auth'
import { EVENTS_PATH } from '@/features/events/routes'
import { ORDERS_PATH } from '@/features/orders/routes'
import TitanLogo from './public/TitanLogo.vue'

const router = useRouter()
const { currentUser, logout, isLoggingOut } = useAuth()

const userInitials = computed(() => {
  if (!currentUser.value) return '?'
  return currentUser.value.email.charAt(0).toUpperCase()
})

async function handleLogout() {
  await logout()
}
</script>

<template>
  <header class="app-nav">
    <div class="app-nav-brand" @click="router.push(EVENTS_PATH)">
      <TitanLogo :size="28" />
      <span class="app-nav-title">Titan TV</span>
    </div>

    <nav class="app-nav-links">
      <router-link :to="EVENTS_PATH" class="app-nav-link">Eventos</router-link>
      <router-link :to="ORDERS_PATH" class="app-nav-link">Pedidos</router-link>
    </nav>

    <div id="page-actions" class="app-nav-center" />

    <div v-if="currentUser" class="app-nav-right">
      <div class="app-nav-user">
        <NAvatar :size="32" round>{{ userInitials }}</NAvatar>
        <div class="app-nav-user-info">
          <span class="app-nav-user-name">{{ currentUser.email }}</span>
          <span class="app-nav-user-role">{{ currentUser.role }}</span>
        </div>
      </div>
      <button
        class="app-nav-logout"
        title="Cerrar sesión"
        :disabled="isLoggingOut"
        @click="handleLogout"
      >
        <NIcon :size="18" :component="LogOutOutline" />
      </button>
    </div>
  </header>
</template>

<style scoped src="./styles/app-nav.css" />
