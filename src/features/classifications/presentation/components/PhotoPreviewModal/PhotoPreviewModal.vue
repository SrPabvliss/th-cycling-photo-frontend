<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NModal, NTag } from 'naive-ui'

import type { ISimilarPhoto } from '../../../types/responses/similar-photo.response'
import { getTransformedPhotoUrl } from '@/shared/utils/cdn.utils'

const props = defineProps<{
  show: boolean
  photo: ISimilarPhoto | null
}>()

defineEmits<{
  'update:show': [value: boolean]
  add: []
  close: []
}>()

const imageUrl = computed(() => {
  if (!props.photo) return ''
  return getTransformedPhotoUrl(props.photo.storageKey, 'workspace')
})

const similarityPercent = computed(() => {
  if (!props.photo) return ''
  return `${Math.round(props.photo.similarity * 100)}%`
})
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    :title="photo?.filename ?? ''"
    style="max-width: 900px"
    :mask-closable="true"
    @update:show="$emit('update:show', $event)"
  >
    <div v-if="photo" class="photo-preview-modal">
      <img :src="imageUrl" :alt="photo.filename" class="photo-preview-modal__image" />

      <div class="photo-preview-modal__footer">
        <div class="photo-preview-modal__info">
          <NTag size="small" :bordered="false">Similitud: {{ similarityPercent }}</NTag>
          <NTag v-if="photo.hasClassifications" size="small" type="success" :bordered="false">
            Clasificada
          </NTag>
        </div>

        <div class="photo-preview-modal__actions">
          <NButton type="primary" size="small" @click="$emit('add')"> Agregar al grupo </NButton>
          <NButton size="small" @click="$emit('close')">Cerrar</NButton>
        </div>
      </div>
    </div>
  </NModal>
</template>

<style scoped src="./photo-preview-modal.css" />
