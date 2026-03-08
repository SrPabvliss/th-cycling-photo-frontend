<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NCard, NFlex, NIcon, NSpin } from 'naive-ui'
import { CameraOutline, TrashOutline, ImageOutline } from '@vicons/ionicons5'

import { useUploadCover } from '../../../composables/mutations/use-upload-cover'
import { useRemoveCover } from '../../../composables/mutations/use-remove-cover'
import type { IEventDetail } from '../../../types/responses/event-detail.response'

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp'

const props = defineProps<{
  event: IEventDetail
  eventId: string
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const { mutate: uploadCover, isPending: isUploading } = useUploadCover(props.eventId)
const { mutate: removeCover, isPending: isRemoving } = useRemoveCover(props.eventId)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadCover(file)
  // Reset input so the same file can be re-selected
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <NCard :segmented="{ content: true }">
    <template #header>
      <div>
        <div class="cover-card__title">Imagen de Portada</div>
        <p class="cover-card__subtitle">
          {{
            event.coverImageSource === 'auto' ? 'Asignada automáticamente' : 'Portada del evento'
          }}
        </p>
      </div>
    </template>

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
        @click="removeCover()"
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
  </NCard>
</template>

<style scoped src="./event-cover-card.css"></style>
