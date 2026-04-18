export type EventStatus = 'active' | 'archived'

/** Only 'manual' exists now — the photo-as-cover fallback ('auto') was removed. */
export type CoverImageSource = 'manual'

/** API projection from GET /events — already camelCase from backend */
export interface IApiEventListItem {
  id: string
  slug: string
  name: string
  date: string
  provinceName: string | null
  cantonName: string | null
  coverImageUrl: string | null
  coverImageSlug: string | null
  status: string
  isFeatured: boolean
  photoCount: number
  totalFileSize: number
}

/** Frontend domain type with parsed dates and typed status */
export interface IEventListItem {
  id: string
  slug: string
  name: string
  date: Date
  provinceName: string | null
  cantonName: string | null
  coverImageUrl: string | null
  coverImageSlug: string | null
  status: EventStatus
  isFeatured: boolean
  photoCount: number
  totalFileSize: number
}
