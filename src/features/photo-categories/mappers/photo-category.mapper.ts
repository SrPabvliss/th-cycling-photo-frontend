import type { IApiPhotoCategory, IPhotoCategory } from '../types/responses/photo-category.response'

export function toPhotoCategory(api: IApiPhotoCategory): IPhotoCategory {
  return {
    id: api.id,
    name: api.name,
    scope: api.scope,
    photoCount: api.photoCount,
  }
}
