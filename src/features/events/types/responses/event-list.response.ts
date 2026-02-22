export type EventStatus = 'draft' | 'uploading' | 'processing' | 'completed'

/** API projection from GET /events — already camelCase from backend */
export interface IApiEventListItem {
  id: string
  name: string
  date: string
  location: string | null
  status: string
  totalPhotos: number
  processedPhotos: number
}

/** Frontend domain type with parsed dates and typed status */
export interface IEventListItem {
  id: string
  name: string
  date: Date
  location: string | null
  status: EventStatus
  totalPhotos: number
  processedPhotos: number
}
