<script setup lang="ts">
import SharedImageComparisonSlider from '@/shared/components/ImageComparisonSlider/ImageComparisonSlider.vue'

defineProps<{
  originalSrc: string
  retouchedSrc: string
  alt: string
}>()
</script>

<template>
  <SharedImageComparisonSlider
    :original-src="originalSrc"
    :retouched-src="retouchedSrc"
    :alt="alt"
  />
</template>
