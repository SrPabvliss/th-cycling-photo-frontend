<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NIcon, NSpin } from 'naive-ui'
import { CloudUploadOutline, CheckmarkCircleOutline } from '@vicons/ionicons5'

import { useUploadRetouched } from '@/features/classifications/composables/mutations/use-upload-retouched'
import { PENDING_RETOUCH_KEY } from '../../../composables/queries/use-pending-retouch'
import { useQueryClient } from '@tanstack/vue-query'
import type { IPendingRetouchPhoto } from '../../../types/responses/pending-retouch.response'

const props = defineProps<{
  photo: IPendingRetouchPhoto
}>()

const queryClient = useQueryClient()
const { mutateAsync: uploadRetouched, isPending } = useUploadRetouched()
const fileInput = ref<HTMLInputElement | null>(null)
const uploaded = ref(false)

function triggerUpload() {
  fileInput.value?.click()
}

async function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  await uploadRetouched({ photoId: props.photo.id, file })
  uploaded.value = true
  queryClient.invalidateQueries({ queryKey: PENDING_RETOUCH_KEY })
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="retouch-photo" :class="{ 'retouch-photo--done': uploaded }">
    <div class="retouch-photo__thumb">
      <img :src="photo.thumbnailUrl" :alt="photo.filename" loading="lazy" />
    </div>
    <div class="retouch-photo__info">
      <span class="retouch-photo__filename">{{ photo.filename }}</span>
      <div v-if="uploaded" class="retouch-photo__done">
        <NIcon :component="CheckmarkCircleOutline" :size="16" color="#18a058" />
        Retocada
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

<style scoped src="./retouch-photo-card.css" />
