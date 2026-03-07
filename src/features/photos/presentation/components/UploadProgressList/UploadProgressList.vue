<script setup lang="ts">
import { NText, NVirtualList } from 'naive-ui'

import type { IUploadItem } from '../../../types/upload-status'
import UploadFileRow from '../UploadFileRow/UploadFileRow.vue'

defineProps<{
  items: IUploadItem[]
}>()

const emit = defineEmits<{
  'remove-item': [id: string]
}>()
</script>

<template>
  <div class="progress-list">
    <NVirtualList
      v-if="items.length"
      :items="items"
      :item-size="52"
      item-resizable
      key-field="id"
      class="progress-list__scroll"
    >
      <template #default="{ item }">
        <UploadFileRow :item="item as IUploadItem" @remove="emit('remove-item', $event)" />
      </template>
    </NVirtualList>

    <div v-else class="progress-list__empty">
      <NText depth="3">No hay archivos en cola</NText>
    </div>
  </div>
</template>

<style scoped src="./upload-progress-list.css"></style>
