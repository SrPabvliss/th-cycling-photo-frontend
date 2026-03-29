import type { EventAssetType } from '../types/asset-type'

export interface IAssetTypeConfig {
  label: string
  hint: string
  acceptTypes: string
  maxSizeMb: number
  aspectRatio: string
}

export const ASSET_TYPE_CONFIG: Record<EventAssetType, IAssetTypeConfig> = {
  cover_image: {
    label: 'Imagen de Portada',
    hint: '16:9 · mín. 1280×720px',
    acceptTypes: 'image/jpeg,image/png,image/webp',
    maxSizeMb: 5,
    aspectRatio: '16 / 9',
  },
  event_logo: {
    label: 'Logo',
    hint: '1:1 · PNG transparente',
    acceptTypes: 'image/jpeg,image/png,image/webp',
    maxSizeMb: 2,
    aspectRatio: '1 / 1',
  },
  hero_image: {
    label: 'Imagen Hero',
    hint: '16:5 · mín. 1920×600px',
    acceptTypes: 'image/jpeg,image/png,image/webp',
    maxSizeMb: 5,
    aspectRatio: '16 / 5',
  },
  poster: {
    label: 'Póster',
    hint: '4:5 · 1080×1350px',
    acceptTypes: 'image/jpeg,image/png,image/webp',
    maxSizeMb: 5,
    aspectRatio: '4 / 5',
  },
} as const

export const ASSET_TYPES_ORDER: EventAssetType[] = [
  'cover_image',
  'event_logo',
  'hero_image',
  'poster',
]
