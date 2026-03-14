<script setup lang="ts">
import { NButton, NIcon, NTag } from 'naive-ui'
import { CreateOutline, TrashOutline } from '@vicons/ionicons5'

import type { ICyclistListItem } from '../../../types/responses/cyclist-list.response'

defineProps<{
  cyclist: ICyclistListItem
}>()

defineEmits<{
  edit: []
  delete: []
}>()
</script>

<template>
  <div class="cyclist-card">
    <div class="cyclist-card__info">
      <div class="cyclist-card__plate">
        {{ cyclist.plateNumber ? `#${cyclist.plateNumber}` : 'Sin dorsal' }}
      </div>
      <div class="cyclist-card__meta">
        <NTag size="tiny" :bordered="false" :type="cyclist.source === 'ai' ? 'info' : 'default'">
          {{ cyclist.source === 'ai' ? 'IA' : 'Manual' }}
        </NTag>
        <span>{{ cyclist.colorCount }} {{ cyclist.colorCount === 1 ? 'color' : 'colores' }}</span>
      </div>
    </div>
    <div class="cyclist-card__actions">
      <NButton quaternary circle size="tiny" @click="$emit('edit')">
        <template #icon><NIcon :component="CreateOutline" /></template>
      </NButton>
      <NButton quaternary circle size="tiny" @click="$emit('delete')">
        <template #icon><NIcon :component="TrashOutline" /></template>
      </NButton>
    </div>
  </div>
</template>

<style scoped src="./cyclist-card.css" />
