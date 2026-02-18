<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { NMenu, NAvatar, NIcon } from 'naive-ui'
import { LogOut } from '@vicons/ionicons5'

import { PRIMARY } from '@/core/theme/titan-tv-theme'
import { sidebarMenuOptions } from './constants/sidebar-menu'

defineProps<{
  collapsed: boolean
}>()

const router = useRouter()
const route = useRoute()

function handleMenuUpdate(key: string) {
  router.push(key)
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

    <div v-if="!collapsed" class="sidebar-footer">
      <NAvatar :size="36" round> CM </NAvatar>
      <div class="sidebar-user">
        <span class="sidebar-user-name">Carlos Miranda</span>
        <span class="sidebar-user-role">Operador</span>
      </div>
      <button class="sidebar-logout" title="Cerrar sesión">
        <NIcon :size="22" :component="LogOut" />
      </button>
    </div>
  </div>
</template>

<style scoped src="./styles/app-sidebar.css" />
