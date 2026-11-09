<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'

const emit = defineEmits<{
  clear: []
}>()

function handleClear() {
  emit('clear')
}
</script>

<template>
  <div class="oes-empty">
    <span class="oes-empty__icon">
      <NIcon :component="SearchOutline" :size="22" />
    </span>
    <b>Nada coincide con la búsqueda</b>
    <span class="oes-empty__hint"
      >Prueba con el nombre comercial completo o con el correo del titular.</span
    >
    <NButton class="oes-empty__action" data-test="clear-search" @click="handleClear"
      >Limpiar búsqueda</NButton
    >
  </div>
</template>

<style scoped src="./organizer-empty-states.css" />
