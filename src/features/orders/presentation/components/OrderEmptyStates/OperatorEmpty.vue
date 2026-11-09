<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { PeopleOutline } from '@vicons/ionicons5'
</script>

<template>
  <div class="oes-empty oes-empty--tall" data-test="operator-empty">
    <span class="oes-empty__icon">
      <NIcon :component="PeopleOutline" :size="22" />
    </span>
    <b>No tienes eventos asignados</b>
    <span class="oes-empty__hint">
      Solo ves los pedidos de los eventos en los que te asignaron. Pide al organizador que te asigne
      uno para empezar a cobrar y entregar.
    </span>
  </div>
</template>

<style scoped src="./order-empty-states.css" />
