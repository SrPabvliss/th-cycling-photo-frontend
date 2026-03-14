<script setup lang="ts">
import { ref } from 'vue'
import { useImageComparison } from '../../../composables/use-image-comparison'

defineProps<{
  originalSrc: string
  retouchedSrc: string
  alt: string
}>()

const containerRef = ref<HTMLElement>()
const originalImgRef = ref<HTMLImageElement>()

const {
  viewMode,
  sliderPosition,
  imgWidth,
  imgHeight,
  retouchedClipLeft,
  showDivider,
  syncImageSize,
  handleDragStart,
  handleDragMove,
  handleDragEnd,
} = useImageComparison(containerRef, originalImgRef)
</script>

<template>
  <div ref="containerRef" class="comparison">
    <!-- Original image (relative — drives container size) -->
    <img
      ref="originalImgRef"
      :src="originalSrc"
      :alt="`${alt} - Original`"
      class="comparison__original"
      @load="syncImageSize"
    />

    <!-- Retouched overlay (absolute, clipped from left → visible on right) -->
    <div
      class="comparison__retouched-wrapper"
      :style="{ clipPath: `inset(0 0 0 ${retouchedClipLeft})` }"
    >
      <img
        :src="retouchedSrc"
        :alt="`${alt} - Retocada`"
        class="comparison__retouched"
        :style="{ '--img-width': imgWidth, '--img-height': imgHeight } as any"
      />
    </div>

    <!-- Invisible drag area — sits above images but below UI controls -->
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

    <!-- Divider line + handle (slider mode only) -->
    <template v-if="showDivider">
      <div class="comparison__divider" :style="{ left: `${sliderPosition}%` }">
        <div class="comparison__handle">
          <span class="comparison__arrow comparison__arrow--left" />
          <span class="comparison__arrow comparison__arrow--right" />
        </div>
      </div>
    </template>

    <!-- Labels: in slider mode show both sides, in single mode show one centered -->
    <template v-if="viewMode === 'slider'">
      <span class="comparison__label comparison__label--left">Original</span>
      <span class="comparison__label comparison__label--right">Retocada</span>
    </template>
    <span v-else class="comparison__label comparison__label--center">
      {{ viewMode === 'original' ? 'Original' : 'Retocada' }}
    </span>

    <!-- Toggle pill — frosted glass background so it's always readable -->
    <div class="comparison__toggles">
      <button
        class="comparison__toggle-btn"
        :class="{ 'comparison__toggle-btn--active': viewMode === 'original' }"
        @click="viewMode = 'original'"
      >
        Original
      </button>
      <button
        class="comparison__toggle-btn"
        :class="{ 'comparison__toggle-btn--active': viewMode === 'slider' }"
        @click="viewMode = 'slider'"
      >
        Comparar
      </button>
      <button
        class="comparison__toggle-btn"
        :class="{ 'comparison__toggle-btn--active': viewMode === 'retouched' }"
        @click="viewMode = 'retouched'"
      >
        Retocada
      </button>
    </div>
  </div>
</template>

<style scoped src="./image-comparison-slider.css" />
