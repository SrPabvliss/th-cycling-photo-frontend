<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { NAvatar, NDrawer, NDrawerContent, NIcon } from 'naive-ui'
import { LogOutOutline, MenuOutline, CloseOutline } from '@vicons/ionicons5'

import { useAuth } from '@/features/auth/composables/use-auth'
import { getRoleConfig, USER_ROLES } from '@/core/auth/role-config'
import NotificationBell from '@/features/notifications/presentation/components/NotificationBell/NotificationBell.vue'
import TitanLogo from './public/TitanLogo.vue'

const router = useRouter()
const { currentUser, logout, isLoggingOut } = useAuth()

const roleConfig = computed(() => getRoleConfig(currentUser.value?.role ?? USER_ROLES.CUSTOMER))

const isMobile = useMediaQuery('(max-width: 767px)')
const showMenu = ref(false)

const userInitials = computed(() => {
  if (!currentUser.value) return '?'
  const first = currentUser.value.firstName?.charAt(0) ?? ''
  const last = currentUser.value.lastName?.charAt(0) ?? ''
  return (first + last).toUpperCase() || currentUser.value.email.charAt(0).toUpperCase()
})

const displayName = computed(() => {
  if (!currentUser.value) return ''
  if (currentUser.value.firstName) {
    return [currentUser.value.firstName, currentUser.value.lastName].filter(Boolean).join(' ')
  }
  return currentUser.value.email
})

async function handleLogout() {
  showMenu.value = false
  await logout()
}

function goTo(path: string) {
  showMenu.value = false
  router.push(path)
}
</script>

<template>
  <header class="app-nav">
    <button
      v-if="isMobile"
      class="app-nav-mobile-btn"
      aria-label="Abrir menú"
      @click="showMenu = true"
    >
      <NIcon :component="MenuOutline" :size="22" />
    </button>

    <div class="app-nav-brand" @click="router.push(roleConfig.homePath)">
      <TitanLogo :size="28" />
      <span class="app-nav-title">Titan TV</span>
    </div>

    <nav v-if="!isMobile" class="app-nav-links">
      <template v-for="link in roleConfig.navLinks" :key="link.label">
        <router-link v-if="link.to && !link.disabled" :to="link.to" class="app-nav-link">
          {{ link.label }}
        </router-link>
        <span v-else class="app-nav-link app-nav-link--disabled">
          {{ link.label }}
        </span>
      </template>
    </nav>

    <div id="page-actions" class="app-nav-center" />

    <div v-if="currentUser" class="app-nav-right">
      <NotificationBell />
      <div class="app-nav-user">
        <div class="app-nav-user-info">
          <span class="app-nav-user-name">{{ displayName }}</span>
          <span class="app-nav-user-role">{{ roleConfig.label }}</span>
        </div>
        <NAvatar :size="32" round>{{ userInitials }}</NAvatar>
      </div>
      <button
        v-if="!isMobile"
        class="app-nav-logout"
        title="Cerrar sesión"
        :disabled="isLoggingOut"
        @click="handleLogout"
      >
        <NIcon :size="18" :component="LogOutOutline" />
      </button>
    </div>
  </header>

  <NDrawer v-model:show="showMenu" :width="280" placement="left">
    <NDrawerContent :native-scrollbar="false" body-content-style="padding: 0;">
      <div class="app-nav-menu">
        <div class="app-nav-menu__header">
          <div class="app-nav-menu__brand" @click="goTo(roleConfig.homePath)">
            <TitanLogo :size="28" />
            <span class="app-nav-title">Titan TV</span>
          </div>
          <button class="app-nav-menu__close" aria-label="Cerrar menú" @click="showMenu = false">
            <NIcon :component="CloseOutline" :size="22" />
          </button>
        </div>

        <nav class="app-nav-menu__nav">
          <template v-for="link in roleConfig.navLinks" :key="link.label">
            <router-link
              v-if="link.to && !link.disabled"
              :to="link.to"
              class="app-nav-menu__link"
              @click="showMenu = false"
            >
              {{ link.label }}
            </router-link>
            <span v-else class="app-nav-menu__link app-nav-menu__link--disabled">
              {{ link.label }}
            </span>
          </template>
          <button
            v-if="currentUser"
            class="app-nav-menu__link app-nav-menu__link--button"
            :disabled="isLoggingOut"
            @click="handleLogout"
          >
            <NIcon :size="18" :component="LogOutOutline" />
            <span>Cerrar sesión</span>
          </button>
        </nav>
      </div>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped src="./styles/app-nav.css" />
