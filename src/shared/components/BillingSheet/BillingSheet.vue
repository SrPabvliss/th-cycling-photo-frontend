<script setup lang="ts">
import { computed, ref } from 'vue'
import { NModal } from 'naive-ui'
import { useMediaQuery } from '@vueuse/core'
import ModalCloseButton from '@/shared/components/ModalCloseButton/ModalCloseButton.vue'
import { useDialogFocus } from '@/shared/composables/use-dialog-focus'

const DRAG_CLOSE_THRESHOLD = 110

defineProps<{
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()

const isMobile = useMediaQuery('(max-width: 767px)')
// On a phone it is a modal layer: the focus goes in and stays, Escape closes, the page behind does
// not scroll, and the focus goes back to what opened it. From 768 NModal does all of that.
const sheet = ref<HTMLElement | null>(null)
useDialogFocus(
  sheet,
  () => isMobile.value,
  () => emit('close'),
)

const dragOffset = ref(0)
const dragStartY = ref<number | null>(null)
const sheetStyle = computed(() => ({ transform: `translateY(${dragOffset.value}px)` }))

function onGrabPointerDown(event: PointerEvent) {
  dragStartY.value = event.clientY
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onGrabPointerMove(event: PointerEvent) {
  if (dragStartY.value === null) return
  dragOffset.value = Math.max(0, event.clientY - dragStartY.value)
}

function onGrabPointerUp() {
  if (dragOffset.value > DRAG_CLOSE_THRESHOLD) emit('close')
  dragOffset.value = 0
  dragStartY.value = null
}
</script>

<template>
  <template v-if="isMobile">
    <div class="billing-sheet__scrim" @click="emit('close')" />
    <section
      ref="sheet"
      class="billing-sheet"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      tabindex="-1"
      :style="sheetStyle"
    >
      <div
        class="billing-sheet__grab"
        @pointerdown="onGrabPointerDown"
        @pointermove="onGrabPointerMove"
        @pointerup="onGrabPointerUp"
        @pointercancel="onGrabPointerUp"
      >
        <span class="billing-sheet__handle" />
      </div>
      <header class="billing-sheet__head">
        <b>{{ title }}</b>
        <button
          type="button"
          class="billing-sheet__close"
          aria-label="Cerrar"
          @click="emit('close')"
        >
          ✕
        </button>
      </header>
      <div class="billing-sheet__body">
        <slot />
      </div>
    </section>
  </template>

  <NModal
    v-else
    :show="true"
    preset="card"
    :title="title"
    :aria-label="title"
    :style="{ width: '480px', maxWidth: 'calc(100vw - 32px)' }"
    :closable="false"
    @update:show="(visible: boolean) => !visible && emit('close')"
  >
    <template #header-extra>
      <ModalCloseButton @close="emit('close')" />
    </template>
    <slot />
  </NModal>
</template>

<style scoped src="./billing-sheet.css" />
