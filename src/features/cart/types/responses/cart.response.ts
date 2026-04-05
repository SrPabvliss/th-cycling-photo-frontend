export interface IApiCartPhoto {
  id: string
  url: string
  width: number | null
  height: number | null
}

export interface IApiCartGroup {
  eventId: string
  eventName: string
  eventDate: string
  coverUrl: string | null
  photos: IApiCartPhoto[]
}

export interface ICartPhoto {
  id: string
  url: string
  width: number | null
  height: number | null
}

export interface ICartGroup {
  eventId: string
  eventName: string
  eventDate: Date
  coverUrl: string | null
  photos: ICartPhoto[]
}
