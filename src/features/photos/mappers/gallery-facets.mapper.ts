import type { IApiGalleryFacets, IGalleryFacets } from '../types/responses/gallery-facets.response'

export function toGalleryFacets(api: IApiGalleryFacets): IGalleryFacets {
  return {
    total: api.total,
    withoutBib: api.withoutBib,
    withBib: api.withBib,
    doubtfulBib: api.doubtfulBib,
    correctedBib: api.correctedBib,
    uncategorized: api.uncategorized,
    sold: api.sold,
    unsold: api.unsold,
    categories: api.categories.map((category) => ({ ...category })),
  }
}
