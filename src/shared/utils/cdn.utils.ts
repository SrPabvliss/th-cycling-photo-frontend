import { env } from '@/core/config/env'

/** Options accepted by Cloudflare Image Transforms `/cdn-cgi/image/` URL API. */
export interface IImageTransformOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'auto' | 'webp' | 'avif' | 'json'
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
  gravity?: 'auto' | 'face' | string
  onerror?: 'redirect'
  dpr?: number
  sharpen?: number
  blur?: number
  metadata?: 'none' | 'copyright' | 'keep'
}

/**
 * Predefined transform variants.
 * Add new entries here to support additional sizes — no refactoring needed.
 */
export const IMAGE_VARIANTS = {
  /** Gallery grid cards (~300-400px display width) */
  thumbnail: {
    width: 400,
    quality: 80,
    format: 'auto',
    fit: 'scale-down',
    onerror: 'redirect',
  },
} as const satisfies Record<string, IImageTransformOptions>

export type ImageVariant = keyof typeof IMAGE_VARIANTS

/** Returns the direct CDN URL for a storage key (no transforms — full original). */
export function getPhotoUrl(storageKey: string): string {
  return `${env.VITE_CDN_BASE_URL}/${storageKey}`
}

/**
 * Returns a Cloudflare Image Transform URL for the given storage key.
 *
 * Accepts either a predefined variant name or custom transform options.
 *
 * @example
 * getTransformedPhotoUrl(key, 'thumbnail')
 * getTransformedPhotoUrl(key, { width: 1200, quality: 85, format: 'auto', fit: 'scale-down', onerror: 'redirect' })
 */
export function getTransformedPhotoUrl(
  storageKey: string,
  options: ImageVariant | IImageTransformOptions,
): string {
  const opts = typeof options === 'string' ? IMAGE_VARIANTS[options] : options

  const params = Object.entries(opts)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${v}`)
    .join(',')

  return `${env.VITE_CDN_BASE_URL}/cdn-cgi/image/${params}/${storageKey}`
}
