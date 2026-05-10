import { REVIEW_EVENTS, type IShowCropDetail } from '../constants/review-events'

/** Wraps the show-crop event so cards don't talk to the lightbox directly. */
export function useCropLightbox() {
  function open(src: string | null | undefined, alt: string) {
    if (!src) return
    const detail: IShowCropDetail = { src, alt }
    window.dispatchEvent(new CustomEvent(REVIEW_EVENTS.SHOW_CROP, { detail }))
  }
  return { open }
}
