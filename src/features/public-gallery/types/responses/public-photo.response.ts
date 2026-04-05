/** API projection from GET /public/events/:eventId/photos */
export interface IApiPublicPhoto {
  id: string
  url: string
  width: number | null
  height: number | null
}

export interface IPublicPhoto {
  id: string
  url: string
  width: number | null
  height: number | null
}
