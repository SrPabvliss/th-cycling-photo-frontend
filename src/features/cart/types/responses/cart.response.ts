export interface IApiCartPhoto {
  id: string
  publicSlug: string
}

export interface IApiCartGroup {
  eventId: string
  eventName: string
  eventSlug: string
  startDate: string
  endDate: string
  photos: IApiCartPhoto[]
}

export interface ICartPhoto {
  id: string
  publicSlug: string
}

export interface ICartGroup {
  eventId: string
  eventName: string
  eventSlug: string
  startDate: Date
  endDate: Date
  photos: ICartPhoto[]
}
