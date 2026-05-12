<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { CheckmarkCircleOutline } from '@vicons/ionicons5'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    showAction?: boolean
  }>(),
  {
    title: 'No hay órdenes pendientes de retoque',
    description:
      'Buen trabajo. Volverás a ver órdenes aquí cuando los clientes hagan nuevas compras.',
    showAction: true,
  },
)

defineEmits<{ 'go-dashboard': [] }>()
</script>

<template>
  <div class="retouch-empty-state">
    <div class="retouch-empty-state__card">
      <NIcon :component="CheckmarkCircleOutline" :size="36" class="retouch-empty-state__icon" />
      <h3 class="retouch-empty-state__title">{{ title }}</h3>
      <p class="retouch-empty-state__desc">{{ description }}</p>
      <NButton v-if="showAction" size="small" type="primary" @click="$emit('go-dashboard')">
        Volver al panel
      </NButton>
    </div>
  </div>
</template>

<style scoped src="./retouch-empty-state.css" />
