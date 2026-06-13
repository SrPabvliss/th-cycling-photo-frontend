import type { PhotoSwipeOptions } from 'photoswipe'

/** Aspect-ratio placeholder used until a photo's real size is known. */
export const FALLBACK_WIDTH = 1920
export const FALLBACK_HEIGHT = 1280

/** How close to the end (in slides) before requesting the next page. */
export const PREFETCH_THRESHOLD = 10

/** Static PhotoSwipe options. `pswpModule` and `dataSource` are wired at runtime. */
export const LIGHTBOX_OPTIONS: PhotoSwipeOptions = {
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
}
