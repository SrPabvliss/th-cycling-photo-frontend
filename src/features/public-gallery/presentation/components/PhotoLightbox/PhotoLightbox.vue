<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

import { getGalleryUrl } from '@/shared/utils/cdn.utils'
import type { IPublicPhoto } from '../../../types/responses/public-photo.response'

const props = defineProps<{
  photos: IPublicPhoto[]
  initialIndex: number
  show: boolean
  selectedIds: Set<string>
  eventName?: string
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
    if (typeof document !== 'undefined') {
      document.body.style.overflow = show ? 'hidden' : ''
    }
  },
)

onUnmounted(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})

const currentPhoto = computed(() => props.photos[currentIndex.value])
const isSelected = computed(
  () => currentPhoto.value && props.selectedIds.has(currentPhoto.value.id),
)
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < props.photos.length - 1)
const photoLabel = computed(() => currentPhoto.value?.id.slice(0, 8).toUpperCase())

const similarPhotos = computed(() => {
  const result: { index: number; photo: IPublicPhoto }[] = []
  for (let off = -2; off <= 2; off++) {
    if (off === 0) continue
    const idx = currentIndex.value + off
    const photo = props.photos[idx]
    if (idx >= 0 && idx < props.photos.length && photo) {
      result.push({ index: idx, photo })
    }
  }
  return result
})

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
function jumpTo(index: number) {
  currentIndex.value = index
  isImageLoading.value = true
}

function handleKeydown(e: KeyboardEvent) {
  if (!props.show) return
  if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'Escape') close()
}

if (typeof window !== 'undefined') window.addEventListener('keydown', handleKeydown)
onUnmounted(() => {
  if (typeof window !== 'undefined') window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="lb-fade">
      <div v-if="show && currentPhoto" class="lb-overlay">
        <!-- ══ DESKTOP (1024px+) ══ -->
        <div class="lb-desktop">
          <!-- Stage -->
          <div class="lb-stage" @click.self="close">
            <div class="lb-counter">{{ currentIndex + 1 }} / {{ photos.length }}</div>

            <button v-if="hasPrev" class="lb-nav lb-nav--prev" aria-label="Anterior" @click="prev">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button v-if="hasNext" class="lb-nav lb-nav--next" aria-label="Siguiente" @click="next">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>

            <div class="lb-image-box">
              <div v-if="isImageLoading" class="lb-spinner" />
              <img
                :key="currentPhoto.id"
                :src="getGalleryUrl(currentPhoto.publicSlug)"
                alt=""
                class="lb-img"
                :class="{ 'lb-img--loading': isImageLoading }"
                @load="isImageLoading = false"
              />
              <div class="lb-img-watermark" />
            </div>
          </div>

          <!-- Side panel -->
          <aside class="lb-side">
            <button class="lb-close" aria-label="Cerrar" @click="close">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </svg>
            </button>

            <div class="lb-side-header">
              <h3 class="lb-side-title">{{ eventName ?? 'Galería' }}</h3>
              <div class="lb-side-id">{{ photoLabel }}</div>
            </div>

            <div class="lb-dorsales">
              <h4 class="lb-dorsales-label">Dorsales detectados</h4>
              <div class="lb-dorsales-tags">
                <span class="lb-dorsal-tag">#008</span>
                <span class="lb-dorsal-tag">#006</span>
                <span class="lb-dorsal-tag">#103</span>
              </div>
            </div>

            <div v-if="similarPhotos.length > 0" class="lb-similar">
              <h4 class="lb-similar-label">Imágenes similares</h4>
              <div class="lb-similar-grid">
                <div
                  v-for="item in similarPhotos"
                  :key="item.photo.id"
                  class="lb-similar-thumb"
                  :style="`background-image: url(${getGalleryUrl(item.photo.publicSlug)})`"
                  @click="jumpTo(item.index)"
                />
              </div>
            </div>

            <div class="lb-side-actions">
              <button
                class="lb-add-btn"
                :class="{ 'lb-add-btn--added': isSelected }"
                @click="emit('toggle', currentPhoto.id)"
              >
                <svg
                  v-if="!isSelected"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <svg
                  v-else
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M5 12l5 5L20 7" />
                </svg>
                {{ isSelected ? '✓ En tu pedido — quitar' : 'Agregar al pedido' }}
              </button>
            </div>
          </aside>
        </div>

        <!-- ══ MOBILE (<1024px) ══ -->
        <div class="lb-mobile">
          <div class="lb-mobile-scroll">
            <!-- Header sticky -->
            <div class="lb-mobile-header">
              <div class="lb-mobile-title">{{ eventName ?? 'Galería' }}</div>
              <button class="lb-mobile-close" aria-label="Cerrar" @click="close">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </button>
            </div>

            <div class="lb-mobile-content">
              <div class="lb-mobile-photo-id">{{ photoLabel }}</div>

              <!-- Image -->
              <div class="lb-mobile-image-wrap">
                <button v-if="hasPrev" class="lb-mobile-nav lb-mobile-nav--prev" @click="prev">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div class="lb-mobile-image-box">
                  <img
                    :key="currentPhoto.id"
                    :src="getGalleryUrl(currentPhoto.publicSlug)"
                    alt=""
                    @load="isImageLoading = false"
                  />
                  <div class="lb-mobile-counter">{{ currentIndex + 1 }} / {{ photos.length }}</div>
                </div>
                <button v-if="hasNext" class="lb-mobile-nav lb-mobile-nav--next" @click="next">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </div>

              <!-- Similar -->
              <div v-if="similarPhotos.length > 0" class="lb-mobile-similar">
                <h4>Similares</h4>
                <div class="lb-mobile-similar-grid">
                  <div
                    v-for="item in similarPhotos"
                    :key="item.photo.id"
                    class="lb-mobile-similar-thumb"
                    :style="`background-image: url(${getGalleryUrl(item.photo.publicSlug)})`"
                    @click="jumpTo(item.index)"
                  />
                </div>
              </div>

              <!-- Add button -->
              <div class="lb-mobile-action">
                <button
                  class="lb-mobile-add-btn"
                  :class="{ 'lb-mobile-add-btn--added': isSelected }"
                  @click="emit('toggle', currentPhoto.id)"
                >
                  <svg
                    v-if="!isSelected"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <svg
                    v-else
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  {{ isSelected ? '✓ En pedido' : 'Agregar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped src="./photo-lightbox.css" />
