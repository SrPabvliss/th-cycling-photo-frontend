<script setup lang="ts">
import { computed } from 'vue'
import { NResult, NSpin } from 'naive-ui'

import type { ISimilarPhoto } from '../../../types/responses/similar-photo.response'
import { useSimilarPhotosQuery } from '../../../composables/queries/use-similar-photos'
import SimilarPhotoCard from '../SimilarPhotoCard/SimilarPhotoCard.vue'

const props = defineProps<{
  photoId: string
  groupPhotoIds: string[]
}>()

defineEmits<{
  add: [photo: ISimilarPhoto]
  preview: [photo: ISimilarPhoto]
}>()

const photoIdRef = computed(() => props.photoId)
const { data: similarPhotos, isPending, isError } = useSimilarPhotosQuery(photoIdRef)
</script>

<template>
  <div class="similar-photos-panel">
    <p class="similar-photos-panel__title">Fotos similares ({{ similarPhotos?.length ?? 0 }})</p>

    <NSpin v-if="isPending" size="small" />

    <NResult
      v-else-if="isError"
      status="error"
      size="small"
      title="Error"
      description="No se pudieron cargar las fotos similares"
    />

    <div v-else-if="similarPhotos?.length" class="similar-photos-panel__list">
      <SimilarPhotoCard
        v-for="photo in similarPhotos"
        :key="photo.id"
        :photo="photo"
        :is-in-group="groupPhotoIds.includes(photo.id)"
        @add="$emit('add', photo)"
        @preview="$emit('preview', photo)"
      />
    </div>

    <p v-else class="similar-photos-panel__empty">No se encontraron fotos similares</p>
  </div>
</template>

<style scoped src="./similar-photos-panel.css" />
