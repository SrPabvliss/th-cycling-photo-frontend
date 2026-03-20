<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NAvatar, NIcon } from 'naive-ui'
import { LogOutOutline } from '@vicons/ionicons5'

import { useAuth } from '@/features/auth/composables/use-auth'
import { EVENTS_PATH } from '@/features/events/routes'
import TitanLogo from './public/TitanLogo.vue'

const router = useRouter()
const route = useRoute()
const { currentUser, logout, isLoggingOut } = useAuth()

const navLinks = computed(() => {
  const role = currentUser.value?.role
  const links: Array<{ label: string; path: string }> = []

  if (role === 'admin') {
    links.push({ label: 'Eventos', path: EVENTS_PATH })
  }

  return links
})

const userInitials = computed(() => {
  if (!currentUser.value) return '?'
  return currentUser.value.email.charAt(0).toUpperCase()
})

function isActive(path: string): boolean {
  return route.path.startsWith(path)
}

async function handleLogout() {
  await logout()
}
</script>

<template>
  <header class="app-nav">
    <div class="app-nav-left">
      <div class="app-nav-brand" @click="router.push(EVENTS_PATH)">
        <TitanLogo :size="32" />
        <span class="app-nav-title">Titan TV</span>
      </div>

      <nav class="app-nav-links">
        <RouterLink
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="app-nav-link"
          :class="{ 'app-nav-link--active': isActive(link.path) }"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
    </div>

    <div v-if="currentUser" class="app-nav-right">
      <div class="app-nav-user">
        <NAvatar :size="36" round>{{ userInitials }}</NAvatar>
        <div class="app-nav-user-info">
          <span class="app-nav-user-name">{{ currentUser.email }}</span>
          <span class="app-nav-user-role">{{ currentUser.role }}</span>
        </div>
      </div>
      <button
        class="app-nav-logout"
        title="Cerrar sesion"
        :disabled="isLoggingOut"
        @click="handleLogout"
      >
        <NIcon :size="20" :component="LogOutOutline" />
      </button>
    </div>
  </header>
</template>

<style scoped src="./styles/app-nav.css" />
