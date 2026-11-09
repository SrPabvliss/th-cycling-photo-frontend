/** Base categories are global (any organizer can pick them); own ones belong to one organizer. */
export type PhotoCategoryScope = 'base' | 'own'

/** API projection from GET /photo-categories and GET /events/:eventId/photo-categories */
export interface IApiPhotoCategory {
  id: number
  name: string
  scope: PhotoCategoryScope
  photoCount: number
}

/** Frontend domain type (identity — backend returns camelCase) */
export interface IPhotoCategory {
  id: number
  name: string
  scope: PhotoCategoryScope
  photoCount: number
}
