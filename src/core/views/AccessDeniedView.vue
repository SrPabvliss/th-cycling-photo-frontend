<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton } from 'naive-ui'

import { getHomePath } from '@/core/auth/role-config'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import ErrorPageLayout from './components/ErrorPageLayout.vue'

const router = useRouter()
const authStore = useSessionStore()

function goBack() {
  if (authStore.isAuthenticated) {
    router.push(getHomePath(authStore.currentUser?.permissions ?? []))
  } else if (window.history.length > 1) {
    router.back()
  } else {
    router.push(ROUTE_PATHS.LANDING)
  }
}
</script>

<template>
  <ErrorPageLayout
    illustration="enlaceRoto"
    title="No tienes acceso a esta página"
    description="Esta parte es solo para cuentas autorizadas. Si crees que deberías entrar, escríbenos a info@titantv.com.ec."
  >
    <template #actions>
      <NButton type="primary" size="large" block @click="goBack">Volver</NButton>
      <RouterLink v-slot="{ navigate }" :to="ROUTE_PATHS.LOGIN" custom>
        <NButton text type="primary" size="large" @click="navigate">
          Ingresar con otra cuenta
        </NButton>
      </RouterLink>
    </template>
  </ErrorPageLayout>
</template>
