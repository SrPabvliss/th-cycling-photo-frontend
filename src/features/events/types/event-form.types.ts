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
  assetRemovals?: 'cover_image'[]
  categoryIds?: number[]
}
