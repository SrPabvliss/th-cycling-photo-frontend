<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NDrawer, NDrawerContent, NIcon } from 'naive-ui'
import { MenuOutline, CloseOutline } from '@vicons/ionicons5'

import { useSession } from '@/core/auth/use-session'
import { getHomePath } from '@/core/auth/role-config'
import { canOperate, canShop } from '@/core/auth/capabilities'
import { useHatStore } from '@/core/auth/stores/hat.store'
import { LAYOUT_SLOTS, useLayoutSlot } from '@/core/layout/slot-registry'
import { ROUTE_NAMES } from '@/core/navigation/route-names'
import TitanLogo from './TitanLogo.vue'

const router = useRouter()
const { isAuthenticated, currentUser, logout } = useSession()
const hatStore = useHatStore()

const permissions = computed(() => currentUser.value?.permissions ?? [])
const showShopLinks = computed(() => isAuthenticated.value && canShop(permissions.value))
const showPanelLink = computed(() => isAuthenticated.value && canOperate(permissions.value))

function goPanel() {
  showMenu.value = false
  hatStore.setHat('operating')
  router.push(getHomePath(permissions.value))
}

const navActions = useLayoutSlot(LAYOUT_SLOTS.PUBLIC_NAV_ACTION)
const navOverlays = useLayoutSlot(LAYOUT_SLOTS.PUBLIC_NAV_OVERLAY)
const showMenu = ref(false)

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Galería', href: '/gallery' },
]

async function handleLogout() {
  showMenu.value = false
  await logout()
}

function go(href: string) {
  showMenu.value = false
  router.push(href)
}
</script>

<template>
  <header class="public-navbar">
    <div class="public-navbar-inner">
      <!-- Mobile: hamburger -->
      <button class="public-navbar-mobile-btn" aria-label="Abrir menú" @click="showMenu = true">
        <NIcon :component="MenuOutline" :size="24" />
      </button>

      <div class="public-navbar-brand" @click="router.push('/')">
        <TitanLogo :size="36" />
        <span class="public-navbar-title">TITAN TV</span>
      </div>

      <nav class="public-navbar-links">
        <a v-for="link in navLinks" :key="link.label" :href="link.href" class="public-navbar-link">
          {{ link.label }}
        </a>
        <button
          v-if="showPanelLink"
          class="public-navbar-link public-navbar-link--accent"
          @click="goPanel"
        >
          Ir al panel
        </button>
        <RouterLink
          v-if="showShopLinks"
          :to="{ name: ROUTE_NAMES.ACCOUNT_ORDERS }"
          class="public-navbar-link"
        >
          Mis compras
        </RouterLink>
        <RouterLink
          v-if="showShopLinks"
          :to="{ name: ROUTE_NAMES.ACCOUNT_PROFILE }"
          class="public-navbar-link"
        >
          Mi perfil
        </RouterLink>
        <a v-if="isAuthenticated" class="public-navbar-link" href="#" @click.prevent="handleLogout">
          Cerrar sesión
        </a>
        <RouterLink v-else to="/login" class="public-navbar-link public-navbar-link--accent">
          Inicio de sesión
        </RouterLink>
        <component :is="action" v-for="(action, index) in navActions" :key="index" />
      </nav>

      <!-- Mobile: cart button -->
      <div class="public-navbar-mobile-cart">
        <component :is="action" v-for="(action, index) in navActions" :key="index" />
      </div>
    </div>
  </header>

  <!-- Mobile menu drawer -->
  <NDrawer v-model:show="showMenu" :width="280" placement="left">
    <NDrawerContent :native-scrollbar="false" body-content-style="padding: 0;">
      <div class="public-navbar-menu">
        <div class="public-navbar-menu__header">
          <div class="public-navbar-menu__brand" @click="go('/')">
            <TitanLogo :size="32" />
            <span class="public-navbar-title">TITAN TV</span>
          </div>
          <button
            class="public-navbar-menu__close"
            aria-label="Cerrar menú"
            @click="showMenu = false"
          >
            <NIcon :component="CloseOutline" :size="22" />
          </button>
        </div>

        <nav class="public-navbar-menu__nav">
          <a
            v-for="link in navLinks"
            :key="link.label"
            :href="link.href"
            class="public-navbar-menu__link"
            @click="showMenu = false"
          >
            {{ link.label }}
          </a>
          <button
            v-if="showPanelLink"
            class="public-navbar-menu__link public-navbar-menu__link--accent"
            @click="goPanel"
          >
            Ir al panel
          </button>
          <RouterLink
            v-if="showShopLinks"
            :to="{ name: ROUTE_NAMES.ACCOUNT_ORDERS }"
            class="public-navbar-menu__link"
            @click="showMenu = false"
          >
            Mis compras
          </RouterLink>
          <RouterLink
            v-if="showShopLinks"
            :to="{ name: ROUTE_NAMES.ACCOUNT_PROFILE }"
            class="public-navbar-menu__link"
            @click="showMenu = false"
          >
            Mi perfil
          </RouterLink>
          <a
            v-if="isAuthenticated"
            class="public-navbar-menu__link"
            href="#"
            @click.prevent="handleLogout"
          >
            Cerrar sesión
          </a>
          <RouterLink
            v-else
            to="/login"
            class="public-navbar-menu__link public-navbar-menu__link--accent"
            @click="showMenu = false"
          >
            Inicio de sesión
          </RouterLink>
        </nav>
      </div>
    </NDrawerContent>
  </NDrawer>

  <component :is="overlay" v-for="(overlay, index) in navOverlays" :key="index" />
</template>

<style scoped src="./styles/public-navbar.css" />
