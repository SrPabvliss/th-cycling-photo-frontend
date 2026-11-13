/** Item of GET /public/events. */
export interface IApiPublicEventListItem {
  slug: string
  name: string
  startDate: string
  endDate: string
  provinceName: string | null
  cantonName: string | null
  photoCount: number
  ownerName: string | null
  coverSlug: string | null
  eventTypeId: number
  eventTypeName: string
}

/** A public event as the home and events screens show it. */
export interface IPublicEventListItem {
  slug: string
  name: string
  /** Calendar dates, `yyyy-MM-dd`: an event day is the same day in every time zone. */
  startDate: string
  endDate: string
  /** Canton and province joined, or whichever came; null when the event has no place. */
  placeLabel: string | null
  photoCount: number
  ownerName: string | null
  coverUrl: string | null
  eventTypeId: number
  eventTypeName: string
}

/** What GET /public/events can be narrowed by. */
export interface IPublicEventFilters {
  /** Matches the event, canton or province name. The api takes 2 to 100 characters. */
  search?: string
  eventTypeId?: number
  /** Only events that already have photos. `false` filters nothing. */
  hasPhotos?: boolean
}

export interface IPublicEventType {
  id: number
  name: string
}

/** GET /public/events/filters: the event types that have at least one listed event. */
export interface IPublicEventFilterOptions {
  eventTypes: IPublicEventType[]
}
