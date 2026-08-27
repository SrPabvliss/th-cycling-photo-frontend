<script setup lang="ts">
import { computed, ref } from 'vue'

import type { IWorkspacePhotoDetail } from '@/shared/workspace/types/workspace-photo.types'
import { useImageZoom } from '@/features/photos/composables/use-image-zoom'
import { usePhotoFileOps } from '@/features/photos/composables/use-photo-file-ops'
import ImageComparisonSlider from '@/features/review/presentation/components/ImageComparisonSlider/ImageComparisonSlider.vue'
import { pluralize } from '@/shared/utils/format.utils'

const props = defineProps<{
  photo: IWorkspacePhotoDetail
  hasNext: boolean
  hasPrev: boolean
}>()

const emit = defineEmits<{
  next: []
  prev: []
  retouched: [photoId: string]
}>()

const fileOps = usePhotoFileOps()
const showComparison = ref(false)
type CompareView = 'original' | 'compare' | 'retouched'
const comparisonView = ref<CompareView>('compare')

const imageContainer = ref<HTMLElement>()
const photoId = computed(() => props.photo.id)
const {
  scale,
  translateX,
  translateY,
  isPanning,
  handleWheel,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  resetZoom,
} = useImageZoom(imageContainer, photoId)

const imageTransform = computed(() =>
  scale.value > 1
    ? `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`
    : undefined,
)

const isReviewed = computed(() => props.photo.reviewedAt !== null)
const isRetouched = computed(() => !!props.photo.retouchedImageUrl)
const bibsCount = computed(() => props.photo.bibs?.length ?? 0)
const colorsCount = computed(() => props.photo.colors?.length ?? 0)

const handleDownload = () => fileOps.download(props.photo.id, props.photo.filename)
const triggerUpload = () => fileOps.triggerUpload()
const handleFileSelected = (e: Event) =>
  fileOps.handleFileSelected(e, props.photo.id, () => emit('retouched', props.photo.id))

/** `C` toggles compare mode on/off (no cycle). When entering, default view = compare slider. */
function toggleCompare() {
  if (!props.photo.retouchedImageUrl) {
    showComparison.value = false
    return
  }
  showComparison.value = !showComparison.value
  if (showComparison.value) comparisonView.value = 'compare'
}

function setCompareView(view: CompareView) {
  if (!props.photo.retouchedImageUrl) return
  comparisonView.value = view
  if (!showComparison.value) showComparison.value = true
}

function isCompareActive(): boolean {
  return showComparison.value
}

const displayImageUrl = computed(() => {
  if (!showComparison.value) return props.photo.imageUrl
  if (comparisonView.value === 'retouched' && props.photo.retouchedImageUrl) {
    return props.photo.retouchedImageUrl
  }
  return props.photo.imageUrl
})

const showSlider = computed(
  () =>
    showComparison.value && comparisonView.value === 'compare' && !!props.photo.retouchedImageUrl,
)

defineExpose({
  resetZoom,
  toggleCompare,
  setCompareView,
  isCompareActive,
  download: handleDownload,
  upload: triggerUpload,
})
</script>

<template>
  <section class="rv-photo">
    <div class="rv-photo__top">
      <div class="rv-photo__info">
        <div class="rv-photo__filename mono">{{ photo.filename }}</div>
        <div class="rv-photo__tags">
          <span v-if="isReviewed" class="rv-tag success">revisada</span>
          <span v-else class="rv-tag warn">pendiente de revisar</span>
          <span v-if="isRetouched" class="rv-tag info">retocada</span>
          <span v-if="bibsCount > 0" class="rv-tag neutral"
            >{{ bibsCount }} {{ pluralize(bibsCount, 'placa', 'placas') }}</span
          >
          <span v-if="colorsCount > 0" class="rv-tag neutral">{{ colorsCount }} colores</span>
        </div>
      </div>
      <div class="rv-photo__spacer" />
      <button class="rv-btn" :disabled="fileOps.isDownloading.value" @click="handleDownload">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Descargar
        <span class="rv-kbd">D</span>
      </button>
      <button class="rv-btn" :disabled="fileOps.isUploading.value" @click="triggerUpload">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Subir retocada
        <span class="rv-kbd">U</span>
      </button>
      <button
        v-if="photo.retouchedImageUrl"
        class="rv-btn"
        :data-active="showComparison"
        @click="toggleCompare"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="12" y1="3" x2="12" y2="21" />
        </svg>
        {{ showComparison ? 'Salir comparar' : 'Comparar' }}
        <span class="rv-kbd">C</span>
      </button>
      <button v-if="scale > 1" class="rv-btn" @click="resetZoom">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        Reset
        <span class="rv-kbd">Z</span>
      </button>
      <input
        :ref="(el) => (fileOps.fileInput.value = el as HTMLInputElement)"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style="display: none"
        @change="handleFileSelected"
      />
    </div>

    <div
      ref="imageContainer"
      class="rv-photo__body"
      :class="{ 'rv-photo__body--zoomed': scale > 1 }"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <div class="rv-photo__frame">
        <ImageComparisonSlider
          v-if="showSlider"
          :original-src="photo.imageUrl"
          :retouched-src="photo.retouchedImageUrl!"
          :alt="photo.filename"
        />
        <img
          v-else
          :key="displayImageUrl"
          :src="displayImageUrl"
          :alt="photo.filename"
          class="rv-photo__img"
          :class="{ 'rv-photo__img--no-transition': isPanning }"
          :style="imageTransform ? { transform: imageTransform } : undefined"
          @load="($event.target as HTMLImageElement).dataset.loaded = 'true'"
        />
      </div>

      <div v-if="showComparison && photo.retouchedImageUrl" class="rv-photo__compare-tabs">
        <button
          class="rv-photo__compare-tab"
          :data-active="comparisonView === 'original'"
          @click.stop="setCompareView('original')"
        >
          Original
          <span class="rv-kbd">1</span>
        </button>
        <button
          class="rv-photo__compare-tab"
          :data-active="comparisonView === 'compare'"
          @click.stop="setCompareView('compare')"
        >
          Comparar
          <span class="rv-kbd">2</span>
        </button>
        <button
          class="rv-photo__compare-tab"
          :data-active="comparisonView === 'retouched'"
          @click.stop="setCompareView('retouched')"
        >
          Retocada
          <span class="rv-kbd">3</span>
        </button>
      </div>

      <button
        type="button"
        class="rv-iconbtn rv-photo__nav rv-photo__nav--prev"
        :disabled="!hasPrev"
        aria-label="Foto anterior"
        @click.stop="emit('prev')"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        type="button"
        class="rv-iconbtn rv-photo__nav rv-photo__nav--next"
        :disabled="!hasNext"
        aria-label="Foto siguiente"
        @click.stop="emit('next')"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div class="rv-photo__zoom mono">
        <span>Zoom {{ Math.round(scale * 100) }}%</span>
        <span class="rv-photo__zoom-sep">·</span>
        <span>{{ photo.filename }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped src="./workspace-photo-panel.css" />
