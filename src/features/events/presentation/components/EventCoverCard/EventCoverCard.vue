<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NFlex, NIcon, NSpin } from 'naive-ui'

import CollapsibleCard from '@/shared/components/CollapsibleCard.vue'
import { CameraOutline, TrashOutline, ImageOutline } from '@vicons/ionicons5'

import { useUploadAsset } from '@/features/event-assets/composables/mutations/use-upload-asset'
import { useRemoveAsset } from '@/features/event-assets/composables/mutations/use-remove-asset'
import type { IEventDetail } from '../../../types/responses/event-detail.response'

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp'

const props = defineProps<{
  event: IEventDetail
  eventId: string
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const { mutate: uploadAsset, isPending: isUploading } = useUploadAsset(props.eventId)
const { mutate: removeAsset, isPending: isRemoving } = useRemoveAsset(props.eventId)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadAsset({ file, assetType: 'cover_image' })
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <CollapsibleCard
    title="Imagen de Portada"
    subtitle="Portada visible en la galería pública"
    :default-expanded="false"
  >
    <div class="cover-card__preview">
      <NSpin :show="isUploading || isRemoving">
        <div v-if="event.coverImageUrl" class="cover-card__image-wrapper">
          <img :src="event.coverImageUrl" :alt="event.name" class="cover-card__image" />
        </div>
        <NFlex
          v-else
          vertical
          align="center"
          justify="center"
          :size="8"
          class="cover-card__placeholder"
        >
          <NIcon :component="ImageOutline" :size="32" color="var(--tt-neutral-light)" />
          <span class="cover-card__placeholder-text">Sin imagen de portada</span>
        </NFlex>
      </NSpin>
    </div>

    <NFlex :size="8" style="margin-top: 12px">
      <NButton size="small" :loading="isUploading" :disabled="isRemoving" @click="triggerFileInput">
        <template #icon><NIcon :component="CameraOutline" /></template>
        {{ event.coverImageUrl ? 'Cambiar' : 'Subir imagen' }}
      </NButton>
      <NButton
        v-if="event.coverImageUrl && event.coverImageSource === 'manual'"
        size="small"
        :loading="isRemoving"
        :disabled="isUploading"
        @click="removeAsset('cover_image')"
      >
        <template #icon><NIcon :component="TrashOutline" /></template>
        Eliminar
      </NButton>
    </NFlex>

    <input
      ref="fileInput"
      type="file"
      :accept="ACCEPTED_TYPES"
      style="display: none"
      @change="handleFileChange"
    />
  </CollapsibleCard>
</template>

<style scoped src="./event-cover-card.css"></style>
