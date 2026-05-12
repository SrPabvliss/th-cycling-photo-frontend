<script setup lang="ts">
import { computed } from 'vue'
import { NModal, NButton } from 'naive-ui'
import { useWindowEvent } from '@/shared/composables/use-window-event'

interface IRetouchOrderTransitionModalProps {
  show: boolean
  completedOrderId: string
  completedPhotosCount: number
  nextOrderId: string | null
}

const props = defineProps<IRetouchOrderTransitionModalProps>()
const emit = defineEmits<{
  continue: []
  exit: []
  'update:show': [value: boolean]
}>()

const shortCompletedId = computed(() => props.completedOrderId.slice(0, 8))
const shortNextId = computed(() => (props.nextOrderId ? props.nextOrderId.slice(0, 8) : null))
const completedPhotosLabel = computed(() =>
  props.completedPhotosCount === 1
    ? '1 foto retocada'
    : `${props.completedPhotosCount} fotos retocadas`,
)

const handleContinue = () => {
  if (props.nextOrderId) {
    emit('continue')
  } else {
    emit('exit')
  }
}

const handleExit = () => {
  emit('exit')
}

useWindowEvent('keydown', (e: KeyboardEvent) => {
  if (!props.show) return
  if (e.key === 'Enter' || e.key === 'ArrowRight') {
    e.preventDefault()
    handleContinue()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    handleExit()
  }
})
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :mask-closable="false"
    :closable="false"
    :style="{ width: '440px', maxWidth: '92vw' }"
    :bordered="false"
    size="small"
    class="retouch-transition-modal"
    @update:show="$emit('update:show', $event)"
  >
    <template #header>
      <span class="retouch-transition-modal__title">
        <span class="retouch-transition-modal__check" aria-hidden="true">✓</span>
        Orden #{{ shortCompletedId }} completada
      </span>
    </template>

    <div class="retouch-transition-modal__body">
      <p>{{ completedPhotosLabel }}.</p>
      <p v-if="nextOrderId === null" class="retouch-transition-modal__no-more">
        No hay más órdenes pendientes.
      </p>
    </div>

    <template #footer>
      <div class="retouch-transition-modal__footer">
        <NButton type="primary" autofocus @click="handleContinue">
          <template v-if="nextOrderId !== null"> Continuar con #{{ shortNextId }} </template>
          <template v-else> Ir al panel </template>
        </NButton>
        <NButton @click="handleExit">Salir a la cola</NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./retouch-order-transition-modal.css" />
