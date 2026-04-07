<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NIcon, NSpin } from 'naive-ui'
import { CloudUploadOutline, CheckmarkCircleOutline } from '@vicons/ionicons5'

import { getTransformedPhotoUrl } from '@/shared/utils/cdn.utils'
import { useUploadRetouched } from '@/features/classifications/composables/mutations/use-upload-retouched'
import type { IRetouchQueueItem } from '../../../types/responses/retouch-queue.response'

const props = defineProps<{
  item: IRetouchQueueItem
}>()

const emit = defineEmits<{
  uploaded: [photoId: string]
}>()

const { mutateAsync: uploadRetouched, isPending } = useUploadRetouched()
const fileInput = ref<HTMLInputElement | null>(null)
const justUploaded = ref(false)

const isComplete = () => props.item.isRetouched || justUploaded.value

function triggerUpload() {
  fileInput.value?.click()
}

async function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  await uploadRetouched({ photoId: props.item.photoId, file })
  justUploaded.value = true
  emit('uploaded', props.item.photoId)
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="retouch-item" :class="{ 'retouch-item--done': isComplete() }">
    <div class="retouch-item__thumb">
      <img :src="getTransformedPhotoUrl(item.storageKey, 'thumbnail')" alt="" loading="lazy" />
    </div>
    <div class="retouch-item__actions">
      <div v-if="isComplete()" class="retouch-item__done">
        <NIcon :component="CheckmarkCircleOutline" :size="16" color="#18a058" />
        <span>Retocada</span>
      </div>
      <NSpin v-else-if="isPending" size="small" />
      <NButton v-else size="small" @click="triggerUpload">
        <template #icon><NIcon :component="CloudUploadOutline" /></template>
        Subir retocada
      </NButton>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<style scoped src="./retouch-photo-item.css" />
