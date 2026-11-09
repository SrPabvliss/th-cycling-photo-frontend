<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NMenu, NAvatar, NIcon } from 'naive-ui'
import { LogOut } from '@vicons/ionicons5'

import { PRIMARY } from '@/core/theme/titan-tv-theme'
import { useSession } from '@/core/auth/use-session'
import { sidebarMenuOptions } from './constants/sidebar-menu'

defineProps<{
  collapsed: boolean
}>()

const router = useRouter()
const route = useRoute()
const { currentUser, logout, isLoggingOut } = useSession()

const userInitials = computed(() => {
  if (!currentUser.value) return '?'
  return currentUser.value.email.charAt(0).toUpperCase()
})

function handleMenuUpdate(key: string) {
  router.push(key)
}

async function handleLogout() {
  await logout()
}
</script>

<template>
  <div class="sidebar">
    <div v-if="!collapsed" class="sidebar-header">
      <div class="sidebar-logo">
        <NAvatar
          :size="36"
          :color="PRIMARY"
          style="font-weight: 700; font-size: 15px; border-radius: 8px"
        >
          T
        </NAvatar>
        <span class="sidebar-title">TITAN TV</span>
      </div>
    </div>
    <div v-else class="sidebar-header-collapsed">
      <NAvatar
        :size="36"
        :color="PRIMARY"
        style="font-weight: 700; font-size: 15px; border-radius: 8px"
      >
        T
      </NAvatar>
    </div>

    <nav class="sidebar-nav">
      <NMenu
        :options="sidebarMenuOptions"
        :value="route.path"
        :collapsed="collapsed"
        :collapsed-width="48"
        :indent="0"
        inverted
        @update:value="handleMenuUpdate"
      />
    </nav>

    <div v-if="!collapsed && currentUser" class="sidebar-footer">
      <NAvatar :size="36" round>{{ userInitials }}</NAvatar>
      <div class="sidebar-user">
        <span class="sidebar-user-name">{{ currentUser.email }}</span>
        <span class="sidebar-user-role">{{ currentUser.role }}</span>
      </div>
      <button
        class="sidebar-logout"
        title="Cerrar sesion"
        :disabled="isLoggingOut"
        @click="handleLogout"
      >
        <NIcon :size="22" :component="LogOut" />
      </button>
    </div>
  </div>
</template>

<style scoped src="./styles/app-sidebar.css" />
