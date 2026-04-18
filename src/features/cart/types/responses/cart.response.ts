export interface IApiCartPhoto {
  id: string
  publicSlug: string
}

export interface IApiCartGroup {
  eventId: string
  eventName: string
  eventDate: string
  photos: IApiCartPhoto[]
}

export interface ICartPhoto {
  id: string
  publicSlug: string
}

export interface ICartGroup {
  eventId: string
  eventName: string
  eventDate: Date
  photos: ICartPhoto[]
}
