<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

defineEmits<{
  click: []
}>()
</script>

<template>
  <article class="new-event-card" @click="$emit('click')">
    <div class="new-event-card__icon">
      <NIcon :component="AddOutline" :size="28" />
    </div>
    <h3 class="new-event-card__title">Crear Nuevo Evento</h3>
    <p class="new-event-card__desc">
      Configura una nueva competencia y sube las fotografías para clasificar.
    </p>
  </article>
</template>

<style scoped src="./new-event-card.css"></style>
