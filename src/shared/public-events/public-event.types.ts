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

/**
 * What GET /public/events can be narrowed by. Within a list the choices add up (one discipline or
 * another); between filters they cross. Months are `YYYY-MM`, both ends included.
 */
export interface IPublicEventFilters {
  /** Matches the event, canton or province name. The api takes 2 to 100 characters. */
  search?: string
  eventTypeIds: number[]
  provinceIds: number[]
  from?: string
  to?: string
}

/** A choice of the menus with how many events it would bring, given the other filters. */
export interface IPublicEventFilterOption {
  id: number
  name: string
  count: number
}

export interface IPublicProvinceOption extends IPublicEventFilterOption {
  /** Has at least one public event, whatever the filters. Only these are offered. */
  hasEvents: boolean
}

export interface IPublicMonthOption {
  /** `YYYY-MM`. */
  month: string
  count: number
}

/**
 * GET /public/events/filters. The lists do not depend on the filters, only each `count` does, and
 * it can be 0. Disciplines and provinces come sorted by the api (collation `es`).
 */
export interface IApiPublicEventFilterOptions {
  eventTypes: IPublicEventFilterOption[]
  provinces: IPublicProvinceOption[]
  months: IPublicMonthOption[]
}

export type IPublicEventFilterOptions = IApiPublicEventFilterOptions
