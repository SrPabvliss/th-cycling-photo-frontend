import type { EventStatus } from './event-list.response'

/** API projection from GET /events/:slug — already camelCase from backend */
export interface IApiEventDetail {
  id: string
  slug: string
  name: string
  startDate: string
  endDate: string
  provinceName: string | null
  cantonName: string | null
  provinceId: number | null
  cantonId: number | null
  coverImageUrl: string | null
  coverImageSlug: string | null
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
  slug: string
  name: string
  startDate: Date
  endDate: Date
  provinceName: string | null
  cantonName: string | null
  provinceId: number | null
  cantonId: number | null
  coverImageUrl: string | null
  coverImageSlug: string | null
  status: EventStatus
  photoCount: number
  classifiedCount: number
  totalFileSize: number
  createdAt: Date
  updatedAt: Date
}
