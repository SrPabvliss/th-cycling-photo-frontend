export type EventStatus = 'active' | 'archived'

/** Only 'manual' exists now — the photo-as-cover fallback ('auto') was removed. */
export type CoverImageSource = 'manual'

/** API projection from GET /events — already camelCase from backend */
export interface IApiEventListItem {
  id: string
  name: string
  description: string | null
  date: string
  location: string | null
  provinceName: string | null
  cantonName: string | null
  coverImageUrl: string | null
  coverImageSlug: string | null
  coverImageSource: CoverImageSource | null
  status: string
  isFeatured: boolean
  photoCount: number
  classifiedCount: number
  totalFileSize: number
}

/** Frontend domain type with parsed dates and typed status */
export interface IEventListItem {
  id: string
  name: string
  description: string | null
  date: Date
  location: string | null
  provinceName: string | null
  cantonName: string | null
  coverImageUrl: string | null
  coverImageSlug: string | null
  coverImageSource: CoverImageSource | null
  status: EventStatus
  isFeatured: boolean
  photoCount: number
  classifiedCount: number
  totalFileSize: number
}
