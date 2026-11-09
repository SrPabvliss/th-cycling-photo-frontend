<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'

const props = defineProps<{
  query: string | null
}>()

const emit = defineEmits<{
  clear: []
}>()

const hint = computed(() =>
  props.query
    ? `Ningún evento coincide con "${props.query}" en este estado. Prueba en Todos o borra la búsqueda.`
    : 'Ningún evento coincide con estos filtros en este estado. Prueba en Todos o borra la búsqueda.',
)

function handleClear() {
  emit('clear')
}
</script>

<template>
  <div class="ees-empty" data-test="no-results">
    <span class="ees-empty__icon">
      <NIcon :component="SearchOutline" :size="22" />
    </span>
    <b>Sin resultados</b>
    <span class="ees-empty__hint">{{ hint }}</span>
    <NButton class="ees-empty__action" data-test="clear-filters" @click="handleClear">
      Limpiar filtros
    </NButton>
  </div>
</template>

<style scoped src="./event-empty-states.css" />
