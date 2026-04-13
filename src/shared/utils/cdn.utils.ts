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
 *
 * IMPORTANT: Every unique variant counts as one Cloudflare Image Transform
 * (5k free/month, $0.50 / 1k after). Avoid generating ad-hoc dimensions.
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
  /** Classification workspace (~1400px main panel) */
  workspace: {
    width: 1400,
    quality: 90,
    format: 'auto',
    fit: 'scale-down',
    onerror: 'redirect',
  },
  /** Event cover card (listings, small format) */
  cover_small: {
    width: 400,
    quality: 80,
    format: 'auto',
    fit: 'cover',
    onerror: 'redirect',
  },
  /** Event cover hero (detail page, large format) */
  cover_large: {
    width: 1200,
    quality: 85,
    format: 'auto',
    fit: 'cover',
    onerror: 'redirect',
  },
} as const satisfies Record<string, IImageTransformOptions>

export type ImageVariant = keyof typeof IMAGE_VARIANTS

// ─── Public (watermarked) ───────────────────────────────────────────────

/** Returns the public gallery URL for a photo slug (watermarked by Worker). */
export function getGalleryUrl(slug: string): string {
  return `${env.VITE_CDN_BASE_URL}/gallery/${slug}.jpg`
}

/** Returns a watermarked Cloudflare Image Transform URL (public-facing). */
export function getGalleryTransformUrl(
  slug: string,
  options: ImageVariant | IImageTransformOptions,
): string {
  return buildTransformUrl('gallery', slug, options)
}

// ─── Internal (original, no watermark) ──────────────────────────────────

/** Returns the internal URL for a photo slug (original, no watermark). */
export function getInternalUrl(slug: string): string {
  return `${env.VITE_CDN_BASE_URL}/internal/${slug}.jpg`
}

/** Returns an original Cloudflare Image Transform URL (admin/operator views). */
export function getInternalTransformUrl(
  slug: string,
  options: ImageVariant | IImageTransformOptions,
): string {
  return buildTransformUrl('internal', slug, options)
}

// ─── Event assets (covers, logos — public, no watermark) ────────────────

/** Returns the public /assets/ URL for an EventAsset slug (cover, logo, etc). */
export function getAssetUrl(slug: string): string {
  return `${env.VITE_CDN_BASE_URL}/assets/${slug}.jpg`
}

/** Returns an EventAsset URL wrapped with Cloudflare Image Transforms. */
export function getAssetTransformUrl(
  slug: string,
  options: ImageVariant | IImageTransformOptions,
): string {
  return buildTransformUrl('assets', slug, options)
}

// ─── Shared ─────────────────────────────────────────────────────────────

function buildTransformUrl(
  prefix: 'gallery' | 'internal' | 'assets',
  slug: string,
  options: ImageVariant | IImageTransformOptions,
): string {
  const opts = typeof options === 'string' ? IMAGE_VARIANTS[options] : options

  const params = Object.entries(opts)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${v}`)
    .join(',')

  return `${env.VITE_CDN_BASE_URL}/cdn-cgi/image/${params}/${prefix}/${slug}.jpg`
}
