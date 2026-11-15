<script setup lang="ts">
import { TtSkeleton } from '@/shared/components/loading'

withDefaults(defineProps<{ count?: number }>(), { count: 9 })
</script>

<template>
  <div class="photo-grid" aria-label="Cargando fotos">
    <TtSkeleton
      v-for="n in count"
      :key="n"
      class="photo-grid__placeholder"
      height="auto"
      radius="m"
    />
  </div>
</template>

<style scoped src="../photo-grid.css" />
