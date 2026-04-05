/** API projection from GET /events/:eventId/photo-categories */
export interface IApiPhotoCategory {
  id: number
  name: string
  photoCount: number
}

/** Frontend domain type (identity — backend returns camelCase) */
export interface IPhotoCategory {
  id: number
  name: string
  photoCount: number
}
