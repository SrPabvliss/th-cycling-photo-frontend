<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import { CopyOutline } from '@vicons/ionicons5'

import { message } from '@/core/ui/discrete-api'
import ErrorPageLayout from './components/ErrorPageLayout.vue'

const props = defineProps<{
  error?: Error | unknown
  /** Shown by the error boundary, which can mount the failed content again without a reload. */
  recoverable?: boolean
}>()

const emit = defineEmits<{
  retry: []
}>()

const router = useRouter()

const incidentId = `ERR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

// The stack is for whoever is developing; a visitor gets the incident id.
const errorDetail = computed(() => {
  if (!import.meta.env.DEV || !props.error) return null
  if (props.error instanceof Error) {
    return `${props.error.name}: ${props.error.message}\n\n${props.error.stack ?? ''}`
  }
  return String(props.error)
})

function retry() {
  if (props.recoverable) emit('retry')
  else window.location.reload()
}

function goHome() {
  // Already on the home page there is no navigation to clear the error: retrying does.
  if (props.recoverable) emit('retry')
  router.push('/')
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
    illustration="fallaMecanica"
    title="Tuvimos una falla mecánica"
    description="No pudimos cargar esta página. No es tu conexión, es un problema nuestro."
    :error-info="`ID de incidente: ${incidentId}`"
  >
    <template #actions>
      <NButton type="primary" size="large" block @click="retry">Reintentar</NButton>
      <NButton text class="tt-hit-area" type="primary" size="large" @click="goHome"
        >Volver al inicio</NButton
      >
    </template>
    <template v-if="errorDetail" #extra>
      <div class="error-detail">
        <div class="error-detail__header">
          <span class="error-detail__label">Detalle del error</span>
          <NButton size="tiny" quaternary @click="copyError">
            <template #icon>
              <NIcon :component="CopyOutline" />
            </template>
            Copiar
          </NButton>
        </div>
        <pre class="error-detail__trace">{{ errorDetail }}</pre>
      </div>
    </template>
  </ErrorPageLayout>
</template>

<style scoped>
/* Development only: the stack of the error that brought this page up. */
.error-detail {
  inline-size: 100%;
  overflow: hidden;
  border: thin solid var(--tt-line);
  border-radius: var(--tt-radius-s);
  background: var(--tt-surface-sunken);
  font-family: var(--tt-font-sans);
}

.error-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--tt-space-2) var(--tt-space-3);
  border-block-end: thin solid var(--tt-line);
}

.error-detail__label {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-eyebrow-size);
  line-height: var(--tt-type-eyebrow-line);
  font-weight: var(--tt-type-eyebrow-weight);
  text-transform: uppercase;
}

.error-detail__trace {
  max-block-size: var(--tt-ilu-page);
  margin: 0;
  padding: var(--tt-space-3);
  overflow: auto;
  color: var(--tt-danger-ink);
  font-size: var(--tt-type-label-size);
  line-height: var(--tt-type-caption-line);
  text-align: start;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
