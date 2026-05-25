/** API shape coming from the events module (cross-module projection). */
export interface IApiEventSummary {
  id: string
  slug: string
  name: string
  startDate: string
  endDate: string
  location: string
  coverUrl: string | null
  totalPhotos: number
}

/** Domain shape used inside the operator dashboard widgets. */
export interface IEventSummary {
  id: string
  slug: string
  name: string
  startDate: Date
  endDate: Date
  location: string
  coverUrl: string | null
  totalPhotos: number
}
