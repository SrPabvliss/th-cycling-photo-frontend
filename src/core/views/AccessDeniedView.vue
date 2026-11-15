<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton } from 'naive-ui'

import { getHomePath } from '@/core/auth/role-config'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { useLogoutMutation } from '@/core/auth/use-logout'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import ErrorPageLayout from './components/ErrorPageLayout.vue'

const router = useRouter()
const authStore = useSessionStore()
// With a session open the login page sends back home: entering with another account first ends
// this one, then opens the login page.
const { mutate: signOut, isPending: isSigningOut } = useLogoutMutation()

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
      <NButton
        text
        class="tt-hit-area"
        type="primary"
        size="large"
        :disabled="isSigningOut"
        @click="signOut()"
      >
        Ingresar con otra cuenta
      </NButton>
    </template>
  </ErrorPageLayout>
</template>
