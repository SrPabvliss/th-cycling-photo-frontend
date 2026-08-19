<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NDrawer, NDrawerContent, NIcon } from 'naive-ui'
import { MenuOutline, CloseOutline } from '@vicons/ionicons5'

import { useAuth } from '@/features/auth/composables/use-auth'
import { getHomePath } from '@/core/auth/role-config'
import { USER_ROLES } from '@/core/auth/user-roles'
import { useCartQuery } from '@/features/cart/composables/queries/use-cart'
import CartIcon from '@/features/cart/presentation/components/CartIcon/CartIcon.vue'
import CartDrawer from '@/features/cart/presentation/components/CartDrawer/CartDrawer.vue'
import TitanLogo from './TitanLogo.vue'

const router = useRouter()
const { isAuthenticated, currentUser, logout } = useAuth()

const isCustomer = computed(() => currentUser.value?.role === USER_ROLES.CUSTOMER)
const showPanelLink = computed(() => isAuthenticated.value && !isCustomer.value)
const panelPath = computed(() => getHomePath(currentUser.value?.permissions ?? []))

useCartQuery()

const showCart = ref(false)
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
        <RouterLink
          v-if="showPanelLink"
          :to="panelPath"
          class="public-navbar-link public-navbar-link--accent"
        >
          Ir al panel
        </RouterLink>
        <a v-if="isAuthenticated" class="public-navbar-link" href="#" @click.prevent="handleLogout">
          Cerrar sesión
        </a>
        <RouterLink v-else to="/login" class="public-navbar-link public-navbar-link--accent">
          Inicio de sesión
        </RouterLink>
        <CartIcon @click="showCart = true" />
      </nav>

      <!-- Mobile: cart button -->
      <div class="public-navbar-mobile-cart">
        <CartIcon @click="showCart = true" />
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
          <RouterLink
            v-if="showPanelLink"
            :to="panelPath"
            class="public-navbar-menu__link public-navbar-menu__link--accent"
            @click="showMenu = false"
          >
            Ir al panel
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

  <CartDrawer :show="showCart" @update:show="showCart = $event" />
</template>

<style scoped src="./styles/public-navbar.css" />
