import { getInternalTransformUrl } from '@/shared/utils/cdn.utils'
import type { IApiSimilarPhoto, ISimilarPhoto } from '../types/responses/similar-photo.response'

export function toSimilarPhoto(api: IApiSimilarPhoto): ISimilarPhoto {
  return {
    id: api.id,
    filename: api.filename,
    storageKey: api.storageKey,
    publicSlug: api.publicSlug,
    similarity: api.similarity,
    hasClassifications: api.hasClassifications,
    thumbnailUrl: getInternalTransformUrl(api.publicSlug, 'thumbnail'),
  }
}

export function toSimilarPhotos(items: IApiSimilarPhoto[]): ISimilarPhoto[] {
  return items.map(toSimilarPhoto)
}
