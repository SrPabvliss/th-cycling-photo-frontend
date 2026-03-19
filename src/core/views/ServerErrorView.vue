<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import { ArrowBack, RefreshOutline, CopyOutline } from '@vicons/ionicons5'

import { message } from '@/core/ui/discrete-api'
import ErrorPageLayout from './components/ErrorPageLayout.vue'

const props = defineProps<{
  error?: Error | unknown
}>()

const router = useRouter()

const incidentId = `ERR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

const errorDetail = computed(() => {
  if (!props.error) return null
  if (props.error instanceof Error) {
    return `${props.error.name}: ${props.error.message}\n\n${props.error.stack ?? ''}`
  }
  return String(props.error)
})

function retry() {
  window.location.reload()
}

async function copyError() {
  if (!errorDetail.value) return
  try {
    await navigator.clipboard.writeText(errorDetail.value)
    message.success('Error copiado al portapapeles')
  } catch {
    message.error('No se pudo copiar el error')
  }
}
</script>

<template>
  <ErrorPageLayout
    code="500"
    title="Falla mecanica en la montana."
    description="Nuestros servidores tuvieron una caida inesperada. No te preocupes, esto es culpa nuestra, no tuya. Nuestros mecanicos ya estan solucionando el problema."
    :error-info="`Codigo de error: 500_INTERNAL_SERVER_ERROR | ID de incidente: ${incidentId}`"
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
        <rect x="16" y="14" width="16" height="8" rx="2" fill="#9CA3AF" />
        <rect x="16" y="26" width="16" height="8" rx="2" fill="#9CA3AF" />
        <circle cx="20" cy="18" r="1.5" fill="#105080" />
        <circle cx="24" cy="18" r="1.5" fill="#105080" />
        <circle cx="20" cy="30" r="1.5" fill="#105080" />
        <circle cx="24" cy="30" r="1.5" fill="#105080" />
        <path d="M36 16L40 12" stroke="#105080" stroke-width="2" stroke-linecap="round" />
        <path d="M38 20L42 18" stroke="#105080" stroke-width="2" stroke-linecap="round" />
      </svg>
    </template>
    <template #actions>
      <NButton type="primary" size="large" @click="router.push('/')">
        <template #icon>
          <NIcon :component="ArrowBack" />
        </template>
        Volver al inicio
      </NButton>
      <NButton size="large" @click="retry">
        <template #icon>
          <NIcon :component="RefreshOutline" />
        </template>
        Reintentar conexion
      </NButton>
    </template>
    <template v-if="errorDetail" #extra>
      <div class="error-detail">
        <div class="error-detail-header">
          <span class="error-detail-label">Detalle del error</span>
          <NButton size="tiny" quaternary @click="copyError">
            <template #icon>
              <NIcon :component="CopyOutline" :size="14" />
            </template>
            Copiar
          </NButton>
        </div>
        <pre class="error-detail-trace">{{ errorDetail }}</pre>
      </div>
    </template>
  </ErrorPageLayout>
</template>

<style scoped src="./styles/server-error-view.css" />
