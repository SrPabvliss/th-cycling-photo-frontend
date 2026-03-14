import type { CoverImageSource, EventStatus } from './event-list.response'

/** API projection from GET /events/:id — already camelCase from backend */
export interface IApiEventDetail {
  id: string
  name: string
  date: string
  location: string | null
  provinceName: string | null
  cantonName: string | null
  provinceId: number | null
  cantonId: number | null
  coverImageUrl: string | null
  coverImageSource: CoverImageSource | null
  status: string
  photoCount: number
  classifiedCount: number
  totalFileSize: number
  createdAt: string
  updatedAt: string
}

/** Frontend domain type with parsed dates and typed status */
export interface IEventDetail {
  id: string
  name: string
  date: Date
  location: string | null
  provinceName: string | null
  cantonName: string | null
  provinceId: number | null
  cantonId: number | null
  coverImageUrl: string | null
  coverImageSource: CoverImageSource | null
  status: EventStatus
  photoCount: number
  classifiedCount: number
  totalFileSize: number
  createdAt: Date
  updatedAt: Date
}
