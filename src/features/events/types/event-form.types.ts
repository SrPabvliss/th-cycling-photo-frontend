import type { IFocalPoint } from '@/features/event-assets/composables/use-local-asset-previews'

export interface IEventFormData {
  name: string
  startDate: number | null
  endDate: number | null
  provinceId: number | null
  cantonId: number | null
  eventTypeId: number
}

export interface IEventFormExtra {
  assetFiles?: Map<'cover_image', File>
  assetFocalPoints?: Map<'cover_image', IFocalPoint>
  assetRemovals?: 'cover_image'[]
  categoryIds?: number[]
}
