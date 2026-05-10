<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps<{
  src: string
  alt: string
}>()

const emit = defineEmits<{ close: [] }>()

const dialogEl = ref<HTMLElement>()
let previousFocus: HTMLElement | null = null

// Capture phase so Esc closes the lightbox before bubbling to global shortcuts.
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    emit('close')
  }
}

onMounted(() => {
  previousFocus = document.activeElement as HTMLElement | null
  dialogEl.value?.focus()
  window.addEventListener('keydown', onKey, true)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey, true)
  previousFocus?.focus()
})
</script>

<template>
  <div
    ref="dialogEl"
    class="rv-crop-lightbox"
    role="dialog"
    aria-modal="true"
    :aria-label="`Crop ampliado: ${alt}`"
    tabindex="-1"
    @click.self="emit('close')"
  >
    <div class="rv-crop-lightbox__content">
      <img :src="src" :alt="alt" class="rv-crop-lightbox__img" />
      <div class="rv-crop-lightbox__hint mono"><span class="rv-kbd">Esc</span> para cerrar</div>
    </div>
  </div>
</template>

<style scoped src="./crop-lightbox.css" />
