import { WORKSPACE_EVENTS, type IShowCropDetail } from '../constants/workspace-events'

/** Wraps the show-crop event so cards don't talk to the lightbox directly. */
export function useWorkspaceCropLightbox() {
  function open(src: string | null | undefined, alt: string) {
    if (!src) return
    const detail: IShowCropDetail = { src, alt }
    window.dispatchEvent(new CustomEvent(WORKSPACE_EVENTS.SHOW_CROP, { detail }))
  }
  return { open }
}
