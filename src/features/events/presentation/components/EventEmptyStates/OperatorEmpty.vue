<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { PeopleOutline } from '@vicons/ionicons5'
</script>

<template>
  <div class="ees-empty ees-empty--tall" data-test="operator-empty">
    <span class="ees-empty__icon">
      <NIcon :component="PeopleOutline" :size="22" />
    </span>
    <b>No tienes eventos asignados</b>
    <span class="ees-empty__hint">
      Solo ves los eventos en los que te asignaron. Pide al organizador que te asigne uno para
      empezar a subir y revisar fotos.
    </span>
  </div>
</template>

<style scoped src="./event-empty-states.css" />
