export type EventStatus = 'active' | 'archived'

/** Only 'manual' exists now — the photo-as-cover fallback ('auto') was removed. */
export type CoverImageSource = 'manual'

/** API projection from GET /events — already camelCase from backend */
export interface IApiEventListItem {
  id: string
  slug: string
  name: string
  startDate: string
  endDate: string
  provinceName: string | null
  cantonName: string | null
  coverImageUrl: string | null
  coverImageSlug: string | null
  status: string
  photoCount: number
  totalFileSize: number
}

/** Frontend domain type with parsed dates and typed status */
export interface IEventListItem {
  id: string
  slug: string
  name: string
  startDate: Date
  endDate: Date
  provinceName: string | null
  cantonName: string | null
  coverImageUrl: string | null
  coverImageSlug: string | null
  status: EventStatus
  photoCount: number
  totalFileSize: number
}
