<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useAuth } from '@/features/auth/composables/use-auth'
import { getHomePath } from '@/core/auth/role-config'
import { useCartQuery } from '@/features/cart/composables/queries/use-cart'
import CartIcon from '@/features/cart/presentation/components/CartIcon/CartIcon.vue'
import CartDrawer from '@/features/cart/presentation/components/CartDrawer/CartDrawer.vue'

//const router = useRouter()
const route = useRoute()
const { isAuthenticated, currentUser, logout } = useAuth()

const panelPath = computed(() => getHomePath(currentUser.value?.role ?? 'customer'))

useCartQuery()

const showCart = ref(false)

const navLinks = [
  { label: 'Inicio', to: '/' },
  { label: 'Eventos', to: '/gallery' },
]

async function handleLogout() {
  await logout()
}
</script>

<template>
  <header class="pub-nav">
    <RouterLink to="/" class="pub-nav-brand">
      <img src="/titan-logo.png" alt="Titan TV" class="pub-nav-logo" />
      <div class="pub-nav-wordmark">
        TITAN TV
        <small>DOWNHILL MEDIA · EC</small>
      </div>
    </RouterLink>

    <nav class="pub-nav-links">
      <RouterLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="pub-nav-link"
        :class="{ 'pub-nav-link--active': route.path === link.to }"
      >
        {{ link.label }}
      </RouterLink>
    </nav>

    <div class="pub-nav-actions">
      <template v-if="isAuthenticated">
        <RouterLink :to="panelPath" class="pub-nav-btn">Panel</RouterLink>
        <button class="pub-nav-btn" @click="handleLogout">Salir</button>
      </template>
      <RouterLink v-else to="/login" class="pub-nav-btn">Iniciar sesión</RouterLink>

      <div class="pub-nav-cart">
        <CartIcon @click="showCart = true" />
      </div>
    </div>
  </header>

  <CartDrawer :show="showCart" @update:show="showCart = $event" />
</template>

<style scoped src="./styles/public-navbar.css" />
