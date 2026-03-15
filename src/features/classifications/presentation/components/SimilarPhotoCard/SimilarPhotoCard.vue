<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NTag } from 'naive-ui'

import type { ISimilarPhoto } from '../../../types/responses/similar-photo.response'

const props = defineProps<{
  photo: ISimilarPhoto
  isInGroup: boolean
}>()

defineEmits<{
  preview: []
  add: []
}>()

const similarityPercent = computed(() => `${Math.round(props.photo.similarity * 100)}%`)
</script>

<template>
  <div class="similar-photo-card">
    <img :src="photo.thumbnailUrl" :alt="photo.filename" class="similar-photo-card__thumb" />

    <div class="similar-photo-card__info">
      <p class="similar-photo-card__filename" :title="photo.filename">{{ photo.filename }}</p>
      <div class="similar-photo-card__badges">
        <NTag size="tiny" :bordered="false">{{ similarityPercent }}</NTag>
        <NTag v-if="photo.hasClassifications" size="tiny" type="success" :bordered="false">
          Clasificada
        </NTag>
      </div>
    </div>

    <div class="similar-photo-card__actions">
      <NButton size="tiny" quaternary @click="$emit('preview')">Ver</NButton>
      <NButton v-if="!isInGroup" size="tiny" type="primary" quaternary @click="$emit('add')">
        Agregar
      </NButton>
      <NTag v-else size="tiny" type="info" :bordered="false">Agregada</NTag>
    </div>
  </div>
</template>

<style scoped src="./similar-photo-card.css" />
