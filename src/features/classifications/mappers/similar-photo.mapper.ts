import { getTransformedPhotoUrl } from '@/shared/utils/cdn.utils'
import type { IApiSimilarPhoto, ISimilarPhoto } from '../types/responses/similar-photo.response'

export function toSimilarPhoto(api: IApiSimilarPhoto): ISimilarPhoto {
  return {
    id: api.id,
    filename: api.filename,
    storageKey: api.storageKey,
    similarity: api.similarity,
    hasClassifications: api.hasClassifications,
    thumbnailUrl: getTransformedPhotoUrl(api.storageKey, 'thumbnail'),
  }
}

export function toSimilarPhotos(items: IApiSimilarPhoto[]): ISimilarPhoto[] {
  return items.map(toSimilarPhoto)
}
