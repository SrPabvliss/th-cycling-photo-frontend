<script setup lang="ts">
import { computed } from 'vue'
import { NButton } from 'naive-ui'

import { ProgressCount } from '@/shared/components/loading'
import type { ISequentialDownload } from './use-sequential-download'

const props = defineProps<{
  label: string
  download: ISequentialDownload
}>()

const state = computed(() => props.download.state.value)
const done = computed(() => props.download.done.value)
const total = computed(() => props.download.total.value)

const notice = computed(() => {
  if (state.value === 'done' && total.value > 0) {
    // The page cannot see the files land: it says what it did, and where to look.
    const sent = total.value === 1 ? 'enviamos tu foto' : `enviamos tus ${total.value} fotos`
    return `Listo: ${sent} a descargas. Revisa la carpeta de descargas de tu navegador.`
  }
  if (state.value === 'stopped')
    return `Descarga detenida en la foto ${done.value} de ${total.value}.`
  if (state.value === 'failed') {
    return total.value > 0
      ? `Se cortó la descarga en la foto ${done.value + 1} de ${total.value}. Intenta de nuevo.`
      : 'No pudimos empezar la descarga. Intenta de nuevo.'
  }
  return null
})
</script>

<template>
  <div class="download-all">
    <ProgressCount v-if="state === 'running'" label="Descargando" :done="done" :total="total">
      <template #action>
        <button type="button" class="download-all__stop" @click="download.stop()">Detener</button>
      </template>
    </ProgressCount>

    <NButton
      v-else
      type="primary"
      size="large"
      block
      @click="state === 'failed' ? download.resume() : download.start()"
    >
      <template #icon>
        <svg class="download-all__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
        </svg>
      </template>
      {{ state === 'failed' ? 'Continuar descarga' : label }}
    </NButton>

    <p v-if="notice" class="download-all__notice" :role="state === 'failed' ? 'alert' : 'status'">
      {{ notice }}
    </p>
  </div>
</template>

<style scoped>
.download-all {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-2);
  font-family: var(--tt-font-sans);
}

.download-all__stop {
  min-block-size: var(--tt-control-s);
  padding: 0;
  border: 0;
  background: none;
  color: var(--tt-primary-ink);
  font: inherit;
  font-weight: var(--tt-type-title-weight);
  cursor: pointer;
}

.download-all__icon {
  inline-size: var(--tt-icon-m);
  block-size: var(--tt-icon-m);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.download-all__notice {
  margin: 0;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
}
</style>
