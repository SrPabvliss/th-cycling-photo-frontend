<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  current: number
  total: number
}>()

const percentage = computed(() => {
  if (props.total === 0) return 0
  return Math.round((props.current / props.total) * 100)
})
</script>

<template>
  <div class="progress-bar">
    <div class="progress-bar__track">
      <div class="progress-bar__fill" :style="{ width: `${percentage}%` }" />
    </div>
    <span class="progress-bar__text">{{ current }} de {{ total }} fotos</span>
  </div>
</template>

<style scoped src="./workspace-progress-bar.css" />
