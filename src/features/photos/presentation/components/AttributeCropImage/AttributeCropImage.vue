<script setup lang="ts">
import { ref, watch } from 'vue'
import './attribute-crop-image.css'

const props = defineProps<{
  cropUrl: string | null
  alt: string
}>()

const errored = ref(false)

watch(
  () => props.cropUrl,
  () => {
    errored.value = false
  },
)
</script>

<template>
  <div class="attribute-crop-image">
    <img
      v-if="cropUrl !== null && !errored"
      :src="cropUrl"
      :alt="alt"
      loading="lazy"
      class="attribute-crop-image__img"
      @error="errored = true"
    />
    <div v-else class="attribute-crop-image__fallback">
      <span>Crop no disponible</span>
    </div>
  </div>
</template>
