<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NIcon, NSpin } from 'naive-ui'
import { ChevronBack, ChevronForward } from '@vicons/ionicons5'

import type { IOrderDetailPhoto } from '../../../types/responses/order-detail.response'

const PHOTOS_PER_PAGE = 4

const props = defineProps<{
  photos: IOrderDetailPhoto[]
}>()

const photoPage = ref(0)
const previewPhoto = ref<IOrderDetailPhoto | null>(null)
const previewLoading = ref(false)

watch(previewPhoto, (photo) => {
  previewLoading.value = !!photo
})

const visiblePhotos = computed(() => {
  const start = photoPage.value * PHOTOS_PER_PAGE
  return props.photos.slice(start, start + PHOTOS_PER_PAGE)
})

const totalPages = computed(() => Math.ceil(props.photos.length / PHOTOS_PER_PAGE))
const hasNext = computed(() => (photoPage.value + 1) * PHOTOS_PER_PAGE < props.photos.length)
const hasPrev = computed(() => photoPage.value > 0)
</script>

<template>
  <div class="od-photos">
    <div class="od-photos__head">
      <span class="od-photos__title">Fotos seleccionadas</span>
      <span class="od-photos__count">{{ photos.length }} archivos</span>
    </div>
    <div class="od-photos__carousel">
      <button
        :class="['od-photos__nav', { 'od-photos__nav--hidden': !hasPrev }]"
        :disabled="!hasPrev"
        @click="photoPage--"
      >
        <NIcon :component="ChevronBack" :size="16" />
      </button>
      <div class="od-photos__track">
        <div
          v-for="photo in visiblePhotos"
          :key="photo.id"
          class="od-photo-tile"
          @click="previewPhoto = photo"
        >
          <img :src="photo.thumbnailUrl" :alt="photo.filename" class="od-photo-tile__img" />
          <div class="od-photo-tile__label">{{ photo.filename }}</div>
        </div>
      </div>
      <button
        :class="['od-photos__nav', { 'od-photos__nav--hidden': !hasNext }]"
        :disabled="!hasNext"
        @click="photoPage++"
      >
        <NIcon :component="ChevronForward" :size="16" />
      </button>
    </div>
    <div v-if="totalPages > 1" class="od-photos__dots">
      <span
        v-for="i in totalPages"
        :key="i"
        :class="['od-photos__dot', { 'od-photos__dot--active': i - 1 === photoPage }]"
        @click="photoPage = i - 1"
      />
    </div>
  </div>

  <!-- Preview overlay -->
  <div v-if="previewPhoto" class="od-preview-overlay" @click="previewPhoto = null">
    <button class="od-preview-close" @click="previewPhoto = null">&times;</button>
    <div class="od-preview-container" @click.stop>
      <NSpin v-if="previewLoading" size="large" />
      <img
        :src="previewPhoto.fullUrl"
        :alt="previewPhoto.filename"
        :class="['od-preview-img', { 'od-preview-img--loading': previewLoading }]"
        @load="previewLoading = false"
      />
    </div>
    <div class="od-preview-filename">{{ previewPhoto.filename }}</div>
  </div>
</template>

<style scoped src="./order-photos-carousel.css" />
