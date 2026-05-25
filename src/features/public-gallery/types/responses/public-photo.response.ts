/** API projection from GET /public/events/:slug/photos */
export interface IApiPublicPhoto {
  id: string
  publicSlug: string
  width: number | null
  height: number | null
}

export interface IPublicPhoto {
  id: string
  publicSlug: string
  width: number | null
  height: number | null
}
