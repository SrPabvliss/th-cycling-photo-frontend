<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import { ArrowBack, IdCardOutline, InformationCircleOutline } from '@vicons/ionicons5'

import { getHomePath } from '@/core/auth/role-config'
import { useSessionStore } from '@/core/auth/stores/session.store'
import ErrorPageLayout from './components/ErrorPageLayout.vue'

const router = useRouter()
const authStore = useSessionStore()

const accessId = `ACC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

function goBack() {
  if (authStore.isAuthenticated) {
    router.push(getHomePath(authStore.currentUser?.permissions ?? []))
  } else if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <ErrorPageLayout
    code="403"
    title="Zona restringida."
    description="Has llegado a un area restringida en la montaña. Este camino es solo para ciclistas autorizados. Verifica tus credenciales o regresa a una ruta segura."
    :error-info="`Codigo de error: 403_FORBIDDEN | ID de acceso: ${accessId}`"
  >
    <template #icon>
      <svg
        width="80"
        height="80"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" rx="12" fill="#1A1F2C" />
        <path
          d="M24 14L34 20V28C34 33 29.5 37 24 38C18.5 37 14 33 14 28V20L24 14Z"
          fill="#9CA3AF"
          stroke="#6B7280"
          stroke-width="1"
        />
        <path
          d="M24 18L30 22V28C30 31 27.5 33.5 24 34.5C20.5 33.5 18 31 18 28V22L24 18Z"
          fill="#4B5563"
        />
      </svg>
    </template>

    <template #accent>
      <div
        style="
          width: 120px;
          height: 4px;
          background: #105080;
          border-radius: 2px;
          margin-bottom: 24px;
        "
      />
    </template>

    <template #actions>
      <NButton type="primary" size="large" @click="goBack">
        <template #icon>
          <NIcon :component="ArrowBack" />
        </template>
        Volver atras
      </NButton>
      <NButton size="large" @click="router.push('/login')">
        <template #icon>
          <NIcon :component="IdCardOutline" />
        </template>
        Verificar acceso
      </NButton>
    </template>

    <template #extra>
      <div class="access-denied-info">
        <NIcon :component="InformationCircleOutline" :size="24" color="#105080" />
        <div>
          <p class="access-denied-info-title">Necesitas acceso?</p>
          <p class="access-denied-info-text">
            Si crees que deberias tener acceso a esta area, contacta al equipo de Titan TV o
            verifica tus credenciales.
          </p>
        </div>
      </div>
    </template>
  </ErrorPageLayout>
</template>

<style scoped src="./styles/access-denied-view.css" />
