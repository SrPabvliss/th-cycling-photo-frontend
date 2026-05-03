<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

import { getGalleryUrl } from '@/shared/utils/cdn.utils'
import type { IPublicPhoto } from '../../../types/responses/public-photo.response'

defineProps<{
  photos: IPublicPhoto[]
  selectedIds: Set<string>
  gridSize?: 'l' | 'm' | 's'
}>()

const emit = defineEmits<{
  toggle: [photoId: string]
  preview: [index: number]
  loadMore: []
}>()

const sentinel = ref<HTMLElement | null>(null)

useIntersectionObserver(sentinel, ([entry]) => {
  if (entry.isIntersecting) emit('loadMore')
})
</script>

<template>
  <div>
    <div class="photo-grid" :class="`photo-grid--${gridSize ?? 'm'}`">
      <div
        v-for="(photo, idx) in photos"
        :key="photo.id"
        class="photo"
        :class="{ 'photo--selected': selectedIds.has(photo.id) }"
        @click="emit('preview', idx)"
      >
        <img :src="getGalleryUrl(photo.publicSlug)" alt="" loading="lazy" />

        <div class="photo-watermark" />
        <div class="photo-frame" />

        <div class="photo-badge">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
          En tu pedido
        </div>

        <button
          class="photo-add-btn"
          :class="{ 'photo-add-btn--added': selectedIds.has(photo.id) }"
          aria-label="Agregar"
          @click.stop="emit('toggle', photo.id)"
        >
          <svg
            v-if="selectedIds.has(photo.id)"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
          <svg
            v-else
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        <div class="photo-id-tag">{{ photo.id.slice(0, 8).toUpperCase() }}</div>
      </div>
    </div>

    <div ref="sentinel" class="sentinel" />
  </div>
</template>

<style scoped src="./public-photo-grid.css" />
