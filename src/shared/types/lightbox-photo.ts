/** Minimal photo shape the shared PhotoLightbox needs to render a slide. */
export interface ILightboxPhoto {
  id: string
  publicSlug: string
  width?: number | null
  height?: number | null
}
