<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { SnowOutline } from '@vicons/ionicons5'

withDefaults(
  defineProps<{
    variant?: 'overlay' | 'inline'
  }>(),
  { variant: 'inline' },
)
</script>

<template>
  <span :class="['frozen-badge', `frozen-badge--${variant}`]">
    <NIcon :component="SnowOutline" :size="13" />
    Congelado
  </span>
</template>

<style scoped src="./frozen-badge.css"></style>
