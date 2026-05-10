<script setup lang="ts">
import { ref } from 'vue'
import { useImageComparison } from '@/features/photos/composables/use-image-comparison'

defineProps<{
  originalSrc: string
  retouchedSrc: string
  alt: string
}>()

const containerRef = ref<HTMLElement>()
const originalImgRef = ref<HTMLImageElement>()

const {
  sliderPosition,
  imgWidth,
  imgHeight,
  retouchedClipLeft,
  syncImageSize,
  handleDragStart,
  handleDragMove,
  handleDragEnd,
} = useImageComparison(containerRef, originalImgRef)
</script>

<template>
  <div ref="containerRef" class="comparison">
    <img
      ref="originalImgRef"
      :src="originalSrc"
      :alt="`${alt} - Original`"
      class="comparison__original"
      @load="syncImageSize"
    />

    <div
      class="comparison__retouched-wrapper"
      :style="{ clipPath: `inset(0 0 0 ${retouchedClipLeft})` }"
    >
      <img
        :src="retouchedSrc"
        :alt="`${alt} - Retocada`"
        class="comparison__retouched"
        :style="{ '--img-width': imgWidth, '--img-height': imgHeight } as Record<string, string>"
      />
    </div>

    <div
      class="comparison__drag-area"
      @mousedown="handleDragStart"
      @mousemove="handleDragMove"
      @mouseup="handleDragEnd"
      @mouseleave="handleDragEnd"
      @touchstart.prevent="handleDragStart"
      @touchmove="handleDragMove"
      @touchend="handleDragEnd"
    />

    <div class="comparison__divider" :style="{ left: `${sliderPosition}%` }">
      <div class="comparison__handle">
        <span class="comparison__arrow comparison__arrow--left" />
        <span class="comparison__arrow comparison__arrow--right" />
      </div>
    </div>
  </div>
</template>

<style scoped src="./image-comparison-slider.css" />
