<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { FlagOutline } from '@vicons/ionicons5'
</script>

<template>
  <div class="ees-empty ees-empty--tall" data-test="first-run">
    <span class="ees-empty__icon">
      <NIcon :component="FlagOutline" :size="22" />
    </span>
    <b>Todavía no hay eventos</b>
    <span class="ees-empty__hint">
      Cuando un organizador con cupo cree su primer evento, aparecerá aquí con sus fotos, su cupo y
      sus ingresos.
    </span>
  </div>
</template>

<style scoped src="./event-empty-states.css" />
