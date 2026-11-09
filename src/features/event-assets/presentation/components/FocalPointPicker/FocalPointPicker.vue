<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    src: string
    aspectRatio?: string
    disabled?: boolean
  }>(),
  { aspectRatio: '16 / 9', disabled: false },
)

const focalX = defineModel<number>('focalX', { required: true })
const focalY = defineModel<number>('focalY', { required: true })

const frame = ref<HTMLElement | null>(null)
const isDragging = ref(false)

const markerStyle = computed(() => ({
  left: `${focalX.value * 100}%`,
  top: `${focalY.value * 100}%`,
}))

const previewStyle = computed(() => ({
  aspectRatio: props.aspectRatio,
  backgroundImage: `url("${props.src}")`,
  backgroundPosition: `${focalX.value * 100}% ${focalY.value * 100}%`,
}))

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function moveTo(event: PointerEvent) {
  const box = frame.value?.getBoundingClientRect()
  if (!box) return
  focalX.value = clamp((event.clientX - box.left) / box.width)
  focalY.value = clamp((event.clientY - box.top) / box.height)
}

function startDrag(event: PointerEvent) {
  if (props.disabled) return
  isDragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  moveTo(event)
}

function drag(event: PointerEvent) {
  if (!isDragging.value) return
  moveTo(event)
}

function endDrag(event: PointerEvent) {
  if (!isDragging.value) return
  isDragging.value = false
  ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
}

function nudge(dx: number, dy: number) {
  if (props.disabled) return
  focalX.value = clamp(focalX.value + dx)
  focalY.value = clamp(focalY.value + dy)
}
</script>

<template>
  <div class="focal">
    <div class="focal__panes">
      <div class="focal__pane">
        <span class="focal__caption">Elige qué debe quedar centrado</span>
        <div
          ref="frame"
          class="focal__frame"
          :class="{ 'is-disabled': disabled }"
          data-test="focal-frame"
          @pointerdown="startDrag"
          @pointermove="drag"
          @pointerup="endDrag"
          @pointercancel="endDrag"
        >
          <img :src="src" alt="Imagen completa" class="focal__image" />
          <button
            type="button"
            class="focal__marker"
            :style="markerStyle"
            :disabled="disabled"
            aria-label="Punto de encuadre"
            data-test="focal-marker"
            @keydown.left.prevent="nudge(-0.02, 0)"
            @keydown.right.prevent="nudge(0.02, 0)"
            @keydown.up.prevent="nudge(0, -0.02)"
            @keydown.down.prevent="nudge(0, 0.02)"
          />
        </div>
      </div>

      <div class="focal__pane">
        <span class="focal__caption">Así se verá recortada</span>
        <div class="focal__preview" :style="previewStyle" data-test="focal-preview" />
      </div>
    </div>

    <p class="focal__hint">
      Arrastra el punto sobre la parte que importa: el recorte se hace alrededor de ese lugar. Con
      el punto seleccionado también puedes moverlo con las flechas.
    </p>
  </div>
</template>

<style scoped src="./focal-point-picker.css" />
