<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { WarningOutline } from '@vicons/ionicons5'

const props = defineProps<{
  failedCount: number
  loading: boolean
}>()

const emit = defineEmits<{
  'retry-all': []
}>()

const title = computed(() =>
  props.failedCount === 1
    ? '1 foto no se pudo clasificar'
    : `${props.failedCount} fotos no se pudieron clasificar`,
)
</script>

<template>
  <div v-if="failedCount > 0" class="cf-banner" data-test="classification-failures-banner">
    <NIcon :component="WarningOutline" :size="17" />
    <div class="cf-text">
      <b>{{ title }}</b>
      <span>No tienen dorsales leídos. Puedes enviarlas de nuevo a clasificar.</span>
    </div>
    <NButton
      size="small"
      type="warning"
      :loading="loading"
      :disabled="loading"
      data-test="retry-all-classification"
      @click="emit('retry-all')"
    >
      Reintentar todas
    </NButton>
  </div>
</template>

<style scoped src="./classification-failures-banner.css" />
