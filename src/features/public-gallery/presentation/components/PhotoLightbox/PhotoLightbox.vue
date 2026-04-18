<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { NIcon, NSpin } from 'naive-ui'
import {
  ChevronBack,
  ChevronForward,
  CloseOutline,
  CartOutline,
  CheckmarkCircle,
} from '@vicons/ionicons5'

import { getGalleryUrl } from '@/shared/utils/cdn.utils'
import type { IPublicPhoto } from '../../../types/responses/public-photo.response'

const props = defineProps<{
  photos: IPublicPhoto[]
  initialIndex: number
  show: boolean
  selectedIds: Set<string>
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  toggle: [photoId: string]
}>()

const currentIndex = ref(props.initialIndex)
const isImageLoading = ref(true)

watch(
  () => props.initialIndex,
  (i) => {
    currentIndex.value = i
  },
)
watch(
  () => props.show,
  (show) => {
    if (show) isImageLoading.value = true
  },
)

const currentPhoto = computed(() => props.photos[currentIndex.value])
const isSelected = computed(
  () => currentPhoto.value && props.selectedIds.has(currentPhoto.value.id),
)
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < props.photos.length - 1)

function prev() {
  if (hasPrev.value) {
    currentIndex.value--
    isImageLoading.value = true
  }
}

function next() {
  if (hasNext.value) {
    currentIndex.value++
    isImageLoading.value = true
  }
}

function close() {
  emit('update:show', false)
}

function handleKeydown(e: KeyboardEvent) {
  if (!props.show) return
  if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'Escape') close()
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div v-if="show && currentPhoto" class="lightbox" @click.self="close">
        <!-- Close -->
        <button class="lightbox__close" @click="close">
          <NIcon :component="CloseOutline" :size="24" />
        </button>

        <!-- Counter -->
        <div class="lightbox__counter">{{ currentIndex + 1 }} / {{ photos.length }}</div>

        <!-- Nav arrows -->
        <button v-if="hasPrev" class="lightbox__nav lightbox__nav--prev" @click="prev">
          <NIcon :component="ChevronBack" :size="28" />
        </button>
        <button v-if="hasNext" class="lightbox__nav lightbox__nav--next" @click="next">
          <NIcon :component="ChevronForward" :size="28" />
        </button>

        <!-- Image -->
        <div class="lightbox__image-container">
          <NSpin v-if="isImageLoading" size="large" class="lightbox__spinner" />
          <img
            :key="currentPhoto.id"
            :src="getGalleryUrl(currentPhoto.publicSlug)"
            alt=""
            class="lightbox__image"
            @load="isImageLoading = false"
          />
        </div>

        <!-- Bottom bar -->
        <div class="lightbox__bottom">
          <button
            class="lightbox__cart-btn"
            :class="{ 'lightbox__cart-btn--active': isSelected }"
            @click="emit('toggle', currentPhoto.id)"
          >
            <NIcon :component="isSelected ? CheckmarkCircle : CartOutline" :size="20" />
            {{ isSelected ? 'Seleccionada' : 'Agregar al pedido' }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped src="./photo-lightbox.css" />
