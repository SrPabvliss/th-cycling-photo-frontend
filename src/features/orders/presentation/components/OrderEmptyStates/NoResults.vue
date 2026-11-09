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
    ? `Ningún pedido de un cliente que coincida con "${props.query}" en este estado. Prueba en Todos o borra la búsqueda.`
    : 'Ningún pedido coincide con estos filtros en este estado. Prueba en Todos o borra los filtros.',
)

function handleClear() {
  emit('clear')
}
</script>

<template>
  <div class="oes-empty" data-test="no-results">
    <span class="oes-empty__icon">
      <NIcon :component="SearchOutline" :size="22" />
    </span>
    <b>Sin resultados</b>
    <span class="oes-empty__hint">{{ hint }}</span>
    <NButton class="oes-empty__action" data-test="clear-filters" @click="handleClear">
      Limpiar filtros
    </NButton>
  </div>
</template>

<style scoped src="./order-empty-states.css" />
