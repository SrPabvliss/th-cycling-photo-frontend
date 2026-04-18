import { env } from '@/core/config/env'

export type AssetPreset = 'cover-sm' | 'cover-lg'

/** Returns the public gallery URL for a photo slug (watermarked by Worker). */
export function getGalleryUrl(slug: string): string {
  return `${env.VITE_CDN_BASE_URL}/gallery/${slug}.jpg`
}

/** Returns the public /assets/ URL for an EventAsset slug (original, no watermark). */
export function getAssetUrl(slug: string): string {
  return `${env.VITE_CDN_BASE_URL}/assets/${slug}.jpg`
}

/** Returns an EventAsset URL with a Worker-handled preset (no cdn-cgi/image exposure). */
export function getAssetPresetUrl(slug: string, preset: AssetPreset): string {
  return `${env.VITE_CDN_BASE_URL}/assets/${preset}/${slug}.jpg`
}
