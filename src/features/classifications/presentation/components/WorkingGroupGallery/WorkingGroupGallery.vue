<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { CloseOutline } from '@vicons/ionicons5'

import type { ISimilarPhoto } from '../../../types/responses/similar-photo.response'
import { getTransformedPhotoUrl } from '@/shared/utils/cdn.utils'

defineProps<{
  currentPhoto: { id: string; storageKey: string; filename: string }
  groupPhotos: ISimilarPhoto[]
  previewPhotoId: string | null
}>()

const emit = defineEmits<{
  preview: [photoId: string | null]
  remove: [photoId: string]
}>()

function thumbnailUrl(storageKey: string) {
  return getTransformedPhotoUrl(storageKey, 'thumbnail')
}
</script>

<template>
  <div class="working-group-gallery">
    <p class="working-group-gallery__title">Grupo de trabajo ({{ groupPhotos.length + 1 }})</p>

    <div class="working-group-gallery__items">
      <div
        class="working-group-gallery__item working-group-gallery__item--current"
        :class="{ 'working-group-gallery__item--active': !previewPhotoId }"
        @click="emit('preview', null)"
      >
        <img
          :src="thumbnailUrl(currentPhoto.storageKey)"
          :alt="currentPhoto.filename"
          class="working-group-gallery__thumb"
        />
      </div>

      <div
        v-for="photo in groupPhotos"
        :key="photo.id"
        class="working-group-gallery__item"
        :class="{ 'working-group-gallery__item--active': previewPhotoId === photo.id }"
        @click="emit('preview', photo.id)"
      >
        <img :src="photo.thumbnailUrl" :alt="photo.filename" class="working-group-gallery__thumb" />
        <NButton
          class="working-group-gallery__remove"
          quaternary
          circle
          size="tiny"
          @click.stop="emit('remove', photo.id)"
        >
          <template #icon><NIcon :component="CloseOutline" :size="10" /></template>
        </NButton>
      </div>
    </div>
  </div>
</template>

<style scoped src="./working-group-gallery.css" />
