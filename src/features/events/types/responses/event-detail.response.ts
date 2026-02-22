import type { EventStatus } from './event-list.response'

/** API projection from GET /events/:id — already camelCase from backend */
export interface IApiEventDetail {
  id: string
  name: string
  date: string
  location: string | null
  status: string
  totalPhotos: number
  processedPhotos: number
  createdAt: string
  updatedAt: string
}

/** Frontend domain type with parsed dates and typed status */
export interface IEventDetail {
  id: string
  name: string
  date: Date
  location: string | null
  status: EventStatus
  totalPhotos: number
  processedPhotos: number
  createdAt: Date
  updatedAt: Date
}
