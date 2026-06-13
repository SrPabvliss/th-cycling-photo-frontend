import type { ILightboxPhoto } from '@/shared/types/lightbox-photo'

export interface IImageSize {
  width: number
  height: number
}

/**
 * Resolves the real pixel size of a photo for the lightbox.
 *
 * Prefers the dimensions the API already provides; when missing it loads the
 * image off-screen once, caches the natural size, and notifies via callback so
 * the caller can refresh the slide (otherwise PhotoSwipe stretches the image to
 * a guessed aspect ratio).
 */
export function useImageDimensions() {
  const cache = new Map<string, IImageSize>()
  const inFlight = new Set<string>()

  /** Returns known dimensions (API or previously measured), or null if unknown. */
  function known(photo: ILightboxPhoto): IImageSize | null {
    if (photo.width && photo.height) return { width: photo.width, height: photo.height }
    return cache.get(photo.id) ?? null
  }

  /** Loads the image to read its natural size, then invokes onResolved once. */
  function measure(photoId: string, src: string, onResolved: (size: IImageSize) => void) {
    if (inFlight.has(photoId) || cache.has(photoId)) return
    inFlight.add(photoId)
    const img = new Image()
    img.onload = () => {
      inFlight.delete(photoId)
      if (!img.naturalWidth || !img.naturalHeight) return
      const size = { width: img.naturalWidth, height: img.naturalHeight }
      cache.set(photoId, size)
      onResolved(size)
    }
    img.onerror = () => inFlight.delete(photoId)
    img.src = src
  }

  return { known, measure }
}
