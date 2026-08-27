<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { NAvatar, NDrawer, NDrawerContent, NIcon } from 'naive-ui'
import { LogOutOutline, MenuOutline, CloseOutline } from '@vicons/ionicons5'

import { useSession } from '@/core/auth/use-session'
import { getHomePath, getNavLinks, getPrincipalLabel } from '@/core/auth/role-config'
import { canShop } from '@/core/auth/capabilities'
import { useHatStore } from '@/core/auth/stores/hat.store'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { LAYOUT_SLOTS, useLayoutSlot } from '@/core/layout/slot-registry'
import TitanLogo from './public/TitanLogo.vue'

const router = useRouter()
const { currentUser, logout, isLoggingOut } = useSession()
const navActions = useLayoutSlot(LAYOUT_SLOTS.APP_NAV_ACTIONS)
const hatStore = useHatStore()

const navLinks = computed(() => getNavLinks(currentUser.value?.permissions ?? []))
const homePath = computed(() => getHomePath(currentUser.value?.permissions ?? []))
const permissions = computed(() => currentUser.value?.permissions ?? [])
const principalLabel = computed(() =>
  getPrincipalLabel(hatStore.activeHat, currentUser.value?.isPlatform ?? false),
)
const showShoppingSwitch = computed(() => canShop(permissions.value))

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

function goShopping() {
  showMenu.value = false
  hatStore.setHat('shopping')
  router.push(ROUTE_PATHS.LANDING)
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

    <div class="app-nav-brand" @click="router.push(homePath)">
      <TitanLogo :size="28" />
      <span class="app-nav-title">Titan TV</span>
    </div>

    <nav v-if="!isMobile" class="app-nav-links">
      <template v-for="link in navLinks" :key="link.label">
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
      <component :is="action" v-for="(action, index) in navActions" :key="index" />
      <div class="app-nav-user">
        <div class="app-nav-user-info">
          <span class="app-nav-user-name">{{ displayName }}</span>
          <span class="app-nav-user-role">{{ principalLabel }}</span>
        </div>
        <NAvatar :size="32" round>{{ userInitials }}</NAvatar>
      </div>
      <button v-if="!isMobile && showShoppingSwitch" class="app-nav-link" @click="goShopping">
        Ir a la tienda
      </button>
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
          <div class="app-nav-menu__brand" @click="goTo(homePath)">
            <TitanLogo :size="28" />
            <span class="app-nav-title">Titan TV</span>
          </div>
          <button class="app-nav-menu__close" aria-label="Cerrar menú" @click="showMenu = false">
            <NIcon :component="CloseOutline" :size="22" />
          </button>
        </div>

        <nav class="app-nav-menu__nav">
          <template v-for="link in navLinks" :key="link.label">
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
            v-if="showShoppingSwitch"
            class="app-nav-menu__link app-nav-menu__link--button"
            @click="goShopping"
          >
            <span>Ir a la tienda</span>
          </button>
          <button
            v-if="currentUser"
            class="app-nav-menu__link app-nav-menu__link--button app-nav-menu__link--destructive"
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
