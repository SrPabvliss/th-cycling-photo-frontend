<script setup lang="ts">
import { ref, computed } from 'vue'
import { NIcon } from 'naive-ui'
import { ChevronBack, ChevronForward, CheckmarkCircle } from '@vicons/ionicons5'

import type { IPreviewPhoto } from '../../../types/responses/preview-data.response'

const props = defineProps<{
  photos: IPreviewPhoto[]
  selectedIds: Set<string>
}>()

const emit = defineEmits<{
  toggleSelect: [id: string]
}>()

const currentIndex = ref(0)

const currentPhoto = computed(() => props.photos[currentIndex.value])
const isCurrentSelected = computed(() =>
  currentPhoto.value ? props.selectedIds.has(currentPhoto.value.id) : false,
)

function goTo(index: number) {
  currentIndex.value = index
}

function prev() {
  currentIndex.value = currentIndex.value > 0 ? currentIndex.value - 1 : props.photos.length - 1
}

function next() {
  currentIndex.value = currentIndex.value < props.photos.length - 1 ? currentIndex.value + 1 : 0
}

function toggleCurrent() {
  if (currentPhoto.value) emit('toggleSelect', currentPhoto.value.id)
}
</script>

<template>
  <div class="carousel">
    <!-- Main photo -->
    <div class="carousel__main">
      <div class="carousel__photo-wrapper" @click="toggleCurrent">
        <img
          v-if="currentPhoto"
          :src="currentPhoto.url"
          alt="Foto del evento"
          class="carousel__photo"
        />

        <!-- Nav arrows inside the photo -->
        <button class="carousel__nav carousel__nav--prev" @click.stop="prev">
          <NIcon :component="ChevronBack" :size="20" />
        </button>
        <button class="carousel__nav carousel__nav--next" @click.stop="next">
          <NIcon :component="ChevronForward" :size="20" />
        </button>

        <!-- Bottom bar: counter + select button -->
        <div class="carousel__viewer-bar">
          <span class="carousel__photo-counter">
            <strong>{{ String(currentIndex + 1).padStart(2, '0') }}</strong>
            / {{ String(photos.length).padStart(2, '0') }}
          </span>
          <button
            class="carousel__select-btn"
            :class="{ 'carousel__select-btn--active': isCurrentSelected }"
            @click.stop="toggleCurrent"
          >
            <span class="carousel__select-chk">
              <svg
                v-if="isCurrentSelected"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            {{ isCurrentSelected ? 'Seleccionada' : 'Seleccionar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Thumbnail strip -->
    <div class="carousel__thumbs">
      <button
        v-for="(photo, index) in photos"
        :key="photo.id"
        :class="[
          'carousel__thumb',
          {
            'carousel__thumb--active': index === currentIndex,
            'carousel__thumb--selected': selectedIds.has(photo.id),
          },
        ]"
        @click="goTo(index)"
      >
        <img :src="photo.url" alt="" class="carousel__thumb-img" />
        <div v-if="selectedIds.has(photo.id)" class="carousel__thumb-check">
          <NIcon :component="CheckmarkCircle" :size="16" color="#fff" />
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped src="./gallery-carousel.css" />
