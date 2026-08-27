<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { WarningOutline } from '@vicons/ionicons5'
import { pluralize } from '@/shared/utils/format.utils'

defineProps<{
  count: number
}>()
</script>

<template>
  <div class="ees-headsup ees-headsup--red" data-test="no-cover-note">
    <NIcon :component="WarningOutline" :size="15" />
    <span>
      <b
        >{{ count }}
        {{ pluralize(count, 'evento activo sin portada', 'eventos activos sin portada') }}.</b
      >
      Están publicados pero invisibles: no salen en la galería y no pueden vender. Subir una portada
      los arregla.
    </span>
  </div>
</template>

<style scoped src="./event-empty-states.css" />
