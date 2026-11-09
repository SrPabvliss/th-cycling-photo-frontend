export interface IApiGalleryFacets {
  total: number
  withoutBib: number
  withBib: number
  doubtfulBib: number
  correctedBib: number
  uncategorized: number
  sold: number
  unsold: number
  categories: Array<{ id: number; name: string; count: number }>
}

export type IGalleryFacets = IApiGalleryFacets
