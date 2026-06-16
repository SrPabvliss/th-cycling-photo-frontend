<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import PhotoSwipe from 'photoswipe'
import 'photoswipe/style.css'

import { getGalleryUrl } from '@/shared/utils/cdn.utils'
import type { ILightboxPhoto } from '@/shared/types/lightbox-photo'
import { useImageDimensions } from '@/shared/composables/use-image-dimensions'
import { useCartToggle } from './use-cart-toggle'
import {
  FALLBACK_WIDTH,
  FALLBACK_HEIGHT,
  PREFETCH_THRESHOLD,
  LIGHTBOX_OPTIONS,
} from './photo-lightbox.config'

const props = withDefaults(
  defineProps<{
    photos: ILightboxPhoto[]
    initialIndex: number
    show: boolean
    actions?: 'select' | 'none'
    selectedIds?: Set<string>
    paginated?: boolean
  }>(),
  {
    actions: 'none',
    selectedIds: () => new Set<string>(),
    paginated: false,
  },
)

const emit = defineEmits<{
  'update:show': [value: boolean]
  toggle: [photoId: string]
  loadMore: []
}>()

let pendingLoadMore = false
let pswp: PhotoSwipe | null = null
let lightboxRef: PhotoSwipeLightbox | null = null

const livePswp = () => pswp ?? lightboxRef?.pswp ?? null

const dimensions = useImageDimensions()
const cartToggle = useCartToggle({
  isSelected: (id) => props.selectedIds.has(id),
  onToggle: (id) => emit('toggle', id),
  getPswp: livePswp,
})

function requestLoadMore() {
  if (!props.paginated || pendingLoadMore) return
  pendingLoadMore = true
  emit('loadMore')
}

function refreshSlide(index: number) {
  const api = livePswp() as unknown as { refreshSlideContent?: (i: number) => void }
  api?.refreshSlideContent?.(index)
}

function buildSlideData(index: number) {
  const p = props.photos[index]
  if (!p) return { src: '', width: 0, height: 0 }
  const src = getGalleryUrl(p.publicSlug)
  const size = dimensions.known(p)
  if (!size) dimensions.measure(p.id, src, () => refreshSlide(index))
  return {
    src,
    width: size?.width ?? FALLBACK_WIDTH,
    height: size?.height ?? FALLBACK_HEIGHT,
    photoId: p.id,
  }
}

function maybePrefetch(index: number) {
  if (index >= props.photos.length - PREFETCH_THRESHOLD) requestLoadMore()
}

function openLightbox(index: number) {
  closeLightbox()

  const lightbox = new PhotoSwipeLightbox({
    ...LIGHTBOX_OPTIONS,
    pswpModule: PhotoSwipe,
    dataSource: Array.from({ length: props.photos.length }, () => ({
      src: '',
      width: FALLBACK_WIDTH,
      height: FALLBACK_HEIGHT,
    })),
  })

  lightbox.addFilter('numItems', () => props.photos.length)
  lightbox.addFilter('itemData', (_itemData, i) => buildSlideData(i))

  if (props.actions === 'select') cartToggle.register(lightbox)

  lightbox.on('change', () => {
    const idx = lightbox.pswp?.currIndex
    if (typeof idx === 'number') maybePrefetch(idx)
  })
  lightbox.on('beforeOpen', () => {
    pswp = lightbox.pswp ?? null
  })
  lightbox.on('afterInit', () => {
    pswp = lightbox.pswp ?? null
  })
  lightbox.on('close', () => emit('update:show', false))
  lightbox.on('destroy', () => {
    pswp = null
    lightboxRef = null
  })

  lightbox.init()
  lightbox.loadAndOpen(index)
  lightboxRef = lightbox
  pswp = lightbox.pswp ?? null
  maybePrefetch(index)
}

function closeLightbox() {
  if (pswp) {
    pswp.close()
    pswp = null
  }
  if (lightboxRef) {
    lightboxRef.destroy()
    lightboxRef = null
  }
}

watch(
  () => props.show,
  (show) => {
    if (show) {
      const idx = Math.max(0, Math.min(props.initialIndex, props.photos.length - 1))
      openLightbox(idx)
    } else {
      closeLightbox()
    }
  },
)

watch(
  () => props.photos.length,
  (newLen, oldLen) => {
    const active = livePswp()
    if (!active || newLen <= oldLen) return
    if (!pswp) pswp = active
    pendingLoadMore = false
    const curr = active.currIndex
    ;[curr - 1, curr, curr + 1, curr + 2]
      .filter((idx) => idx >= 0 && idx < newLen)
      .forEach(refreshSlide)
    ;(active as unknown as { dispatch?: (e: string) => void }).dispatch?.('change')
  },
)

watch(
  () => props.selectedIds,
  () => {
    if (props.actions === 'select') cartToggle.syncCurrent()
  },
  { deep: true },
)

onBeforeUnmount(() => closeLightbox())
</script>

<template>
  <div />
</template>

<style src="./photo-lightbox.css" />
