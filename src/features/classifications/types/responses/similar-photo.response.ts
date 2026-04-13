export interface IApiSimilarPhoto {
  id: string
  filename: string
  storageKey: string
  publicSlug: string
  similarity: number
  hasClassifications: boolean
}

export interface ISimilarPhoto {
  id: string
  filename: string
  storageKey: string
  publicSlug: string
  similarity: number
  hasClassifications: boolean
  thumbnailUrl: string
}
