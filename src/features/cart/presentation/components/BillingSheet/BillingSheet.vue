<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { NModal } from 'naive-ui'
import { useMediaQuery, useScrollLock } from '@vueuse/core'

const DRAG_CLOSE_THRESHOLD = 110

defineProps<{
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()

const isMobile = useMediaQuery('(max-width: 767px)')
const pageScrollLocked = useScrollLock(document.documentElement)

watch(isMobile, (mobile) => (pageScrollLocked.value = mobile), { immediate: true })
onBeforeUnmount(() => (pageScrollLocked.value = false))

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
    <section class="billing-sheet" role="dialog" :aria-label="title" :style="sheetStyle">
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
    :style="{ width: '480px', maxWidth: 'calc(100vw - 32px)' }"
    @update:show="(visible: boolean) => !visible && emit('close')"
  >
    <slot />
  </NModal>
</template>

<style scoped src="./billing-sheet.css" />
