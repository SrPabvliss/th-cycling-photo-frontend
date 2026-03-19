<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAuth } from '@/features/auth/composables/use-auth'
import { EVENTS_PATH } from '@/features/events/routes'
import TitanLogo from './TitanLogo.vue'

const router = useRouter()
const { isAuthenticated, logout } = useAuth()

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Nosotros', href: '/#about' },
  { label: 'Buscar Fotos', href: '/#cta' },
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
          <RouterLink :to="EVENTS_PATH" class="public-navbar-link public-navbar-link--accent">
            Ir al panel
          </RouterLink>
          <a class="public-navbar-link" href="#" @click.prevent="handleLogout"> Cerrar sesion </a>
        </template>
        <RouterLink v-else to="/login" class="public-navbar-link public-navbar-link--accent">
          Acceso equipo
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped src="./styles/public-navbar.css" />
