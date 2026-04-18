<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuth } from '@/features/auth/composables/use-auth'
import { getHomePath } from '@/core/auth/role-config'
import { useCartQuery } from '@/features/cart/composables/queries/use-cart'
import CartIcon from '@/features/cart/presentation/components/CartIcon/CartIcon.vue'
import CartDrawer from '@/features/cart/presentation/components/CartDrawer/CartDrawer.vue'
import TitanLogo from './TitanLogo.vue'

const router = useRouter()
const { isAuthenticated, currentUser, logout } = useAuth()

const panelPath = computed(() => getHomePath(currentUser.value?.role ?? 'customer'))

// Initialize cart query to keep store in sync
useCartQuery()

const showCart = ref(false)

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Galería', href: '/gallery' },
]

async function handleLogout() {
  await logout()
}
</script>

<template>
  <header class="public-navbar">
    <div class="public-navbar-inner">
      <div class="public-navbar-brand" @click="router.push('/')">
        <TitanLogo :size="36" />
        <span class="public-navbar-title">TITAN TV</span>
      </div>
      <nav class="public-navbar-links">
        <a v-for="link in navLinks" :key="link.label" :href="link.href" class="public-navbar-link">
          {{ link.label }}
        </a>
        <template v-if="isAuthenticated">
          <RouterLink :to="panelPath" class="public-navbar-link public-navbar-link--accent">
            Ir al panel
          </RouterLink>
          <a class="public-navbar-link" href="#" @click.prevent="handleLogout"> Cerrar sesion </a>
        </template>
        <RouterLink v-else to="/login" class="public-navbar-link public-navbar-link--accent">
          Acceso equipo
        </RouterLink>
        <CartIcon @click="showCart = true" />
      </nav>
    </div>
  </header>

  <CartDrawer :show="showCart" @update:show="showCart = $event" />
</template>

<style scoped src="./styles/public-navbar.css" />
