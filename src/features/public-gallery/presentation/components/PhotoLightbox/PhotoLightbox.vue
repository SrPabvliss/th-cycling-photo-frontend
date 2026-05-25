<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import PhotoSwipe from 'photoswipe'
import 'photoswipe/style.css'

import { getGalleryUrl } from '@/shared/utils/cdn.utils'
import type { IPublicPhoto } from '../../../types/responses/public-photo.response'

const FALLBACK_W = 1920
const FALLBACK_H = 1280
const PREFETCH_THRESHOLD = 10

const props = defineProps<{
  photos: IPublicPhoto[]
  initialIndex: number
  show: boolean
  selectedIds: Set<string>
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  toggle: [photoId: string]
  loadMore: []
}>()

let pendingLoadMore = false
let pswp: PhotoSwipe | null = null
let lightboxRef: PhotoSwipeLightbox | null = null

function requestLoadMore() {
  if (pendingLoadMore) return
  pendingLoadMore = true
  emit('loadMore')
}

function buildSlideData(index: number) {
  const p = props.photos[index]
  if (!p) return { src: '', width: 0, height: 0 }
  return {
    src: getGalleryUrl(p.publicSlug),
    width: p.width ?? FALLBACK_W,
    height: p.height ?? FALLBACK_H,
    photoId: p.id,
  }
}

const CART_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21.5 8H6"/>
    <circle cx="10" cy="20" r="1.4"/>
    <circle cx="17" cy="20" r="1.4"/>
  </svg>`

const CHECK_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 12l4.5 4.5L20 6"/>
  </svg>`

const CART_LABEL = 'Agregar'
const CHECK_LABEL = 'Seleccionada'

const CART_SVG = `<span class="pswp__cart-icon">${CART_ICON}</span><span class="pswp__cart-label">${CART_LABEL}</span>`

function refreshCartButton(btn: HTMLElement, photoId: string) {
  const selected = props.selectedIds.has(photoId)
  btn.dataset.selected = selected ? 'true' : 'false'
  btn.setAttribute('title', selected ? 'Quitar del carrito' : 'Agregar al carrito')
  btn.setAttribute('aria-label', selected ? 'Quitar del carrito' : 'Agregar al carrito')
  btn.innerHTML = selected
    ? `<span class="pswp__cart-icon">${CHECK_ICON}</span><span class="pswp__cart-label">${CHECK_LABEL}</span>`
    : `<span class="pswp__cart-icon">${CART_ICON}</span><span class="pswp__cart-label">${CART_LABEL}</span>`
}

function currentPhotoId(): string | null {
  const active = pswp ?? lightboxRef?.pswp ?? null
  if (!active) return null
  const data = active.currSlide?.data as { photoId?: string } | undefined
  return data?.photoId ?? null
}

function openLightbox(index: number) {
  closeLightbox()

  const lightbox = new PhotoSwipeLightbox({
    dataSource: Array.from({ length: props.photos.length }, () => ({
      src: '',
      width: FALLBACK_W,
      height: FALLBACK_H,
    })),
    pswpModule: PhotoSwipe,
    loop: false,
    wheelToZoom: true,
    initialZoomLevel: 'fit',
    secondaryZoomLevel: 1.5,
    maxZoomLevel: 4,
    bgOpacity: 0.92,
    showHideAnimationType: 'fade',
    closeTitle: 'Cerrar',
    zoomTitle: 'Zoom',
    arrowPrevTitle: 'Anterior',
    arrowNextTitle: 'Siguiente',
    errorMsg: 'No se pudo cargar la imagen',
    counter: false,
  })

  lightbox.addFilter('numItems', () => props.photos.length)
  lightbox.addFilter('itemData', (_itemData, index) => buildSlideData(index))

  function readPhotoIdFrom(active: PhotoSwipe | null | undefined): string | null {
    if (!active) return null
    const data = active.currSlide?.data as { photoId?: string } | undefined
    return data?.photoId ?? null
  }

  lightbox.on('uiRegister', () => {
    const livePswp = lightbox.pswp
    livePswp?.ui?.registerElement({
      name: 'cart-toggle',
      order: 9,
      isButton: true,
      tagName: 'button',
      html: CART_SVG,
      appendTo: 'bar',
      onInit: (el) => {
        el.classList.add('pswp__cart-toggle')
        const sync = () => {
          const id = readPhotoIdFrom(lightbox.pswp)
          if (id) refreshCartButton(el, id)
        }
        livePswp?.on('change', sync)
        livePswp?.on('afterInit', sync)
        sync()
      },
      onClick: (_e, el) => {
        const id = readPhotoIdFrom(lightbox.pswp)
        if (!id) return
        emit('toggle', id)
        refreshCartButton(el, id)
      },
    })
  })

  lightbox.on('change', () => {
    const idx = lightbox.pswp?.currIndex
    if (typeof idx !== 'number') return
    if (idx >= props.photos.length - PREFETCH_THRESHOLD) {
      requestLoadMore()
    }
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

  if (index >= props.photos.length - PREFETCH_THRESHOLD) {
    requestLoadMore()
  }
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
    const activePswp = pswp ?? lightboxRef?.pswp ?? null
    if (!activePswp || newLen <= oldLen) return
    if (!pswp) pswp = activePswp
    pendingLoadMore = false
    const pswpAny = activePswp as unknown as {
      refreshSlideContent?: (index: number) => void
      dispatch?: (event: string, data?: unknown) => void
    }
    const refreshFn = pswpAny.refreshSlideContent
    if (typeof refreshFn === 'function') {
      const curr = activePswp.currIndex
      const targets = [curr - 1, curr, curr + 1, curr + 2]
      targets.forEach((idx) => {
        if (idx >= 0 && idx < newLen) refreshFn.call(activePswp, idx)
      })
    }
    pswpAny.dispatch?.('change')
  },
)

watch(
  () => props.selectedIds,
  () => {
    if (!pswp) return
    const el = pswp.element?.querySelector<HTMLElement>('.pswp__cart-toggle')
    const id = currentPhotoId()
    if (el && id) refreshCartButton(el, id)
  },
  { deep: true },
)

onBeforeUnmount(() => closeLightbox())
</script>

<template>
  <div />
</template>

<style>
.pswp__button.pswp__cart-toggle {
  width: auto !important;
  min-width: 0;
  height: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #18a058;
  border: 2px solid #fff;
  border-radius: 999px;
  color: #fff;
  cursor: pointer;
  padding: 8px 16px;
  margin: 12px 12px 12px 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 16px rgba(24, 160, 88, 0.4);
  transition:
    background 0.15s,
    transform 0.15s,
    box-shadow 0.15s;
}

.pswp__button.pswp__cart-toggle:hover {
  background: #15803d;
  transform: scale(1.04);
  box-shadow: 0 6px 20px rgba(24, 160, 88, 0.55);
}

.pswp__button.pswp__cart-toggle .pswp__cart-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pswp__button.pswp__cart-toggle svg {
  width: 20px;
  height: 20px;
  display: block;
}

.pswp__button.pswp__cart-toggle .pswp__cart-label {
  white-space: nowrap;
}

.pswp__button.pswp__cart-toggle[data-selected='true'] {
  background: rgba(24, 160, 88, 0.15);
  color: #18a058;
  border-color: #18a058;
  box-shadow: 0 2px 8px rgba(24, 160, 88, 0.25);
}

.pswp__button.pswp__cart-toggle[data-selected='true']:hover {
  background: rgba(24, 160, 88, 0.25);
}

@media (max-width: 640px) {
  .pswp__button.pswp__cart-toggle {
    padding: 6px 12px;
    font-size: 13px;
    margin: 8px;
  }

  .pswp__button.pswp__cart-toggle .pswp__cart-label {
    display: none;
  }

  .pswp__button.pswp__cart-toggle svg {
    width: 22px;
    height: 22px;
  }
}
</style>
