<script setup lang="ts">
defineProps<{
  firstName: string | null
}>()
</script>

<template>
  <h1 class="operator-greeting">Hola, {{ firstName ?? 'Operador' }}.</h1>
</template>

<style scoped src="./operator-greeting.css" />
