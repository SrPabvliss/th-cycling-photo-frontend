<script setup lang="ts">
defineProps<{
  sections: { key: string; label: string }[]
  active: string
}>()

const emit = defineEmits<{
  select: [key: string]
}>()
</script>

<template>
  <nav class="section-rail" aria-label="Secciones del evento">
    <button
      v-for="section in sections"
      :key="section.key"
      type="button"
      class="section-rail__item"
      :class="{ 'section-rail__item--active': section.key === active }"
      @click="emit('select', section.key)"
    >
      {{ section.label }}
    </button>
  </nav>
</template>

<style scoped src="./section-rail.css" />
