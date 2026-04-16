import type { IApiSimilarPhoto, ISimilarPhoto } from '../types/responses/similar-photo.response'

export function toSimilarPhoto(api: IApiSimilarPhoto): ISimilarPhoto {
  return {
    id: api.id,
    filename: api.filename,
    publicSlug: api.publicSlug,
    similarity: api.similarity,
    hasClassifications: api.hasClassifications,
    thumbnailUrl: api.thumbnailUrl,
  }
}

export function toSimilarPhotos(items: IApiSimilarPhoto[]): ISimilarPhoto[] {
  return items.map(toSimilarPhoto)
}
