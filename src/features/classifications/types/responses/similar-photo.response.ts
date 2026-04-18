export interface IApiSimilarPhoto {
  id: string
  filename: string
  publicSlug: string
  thumbnailUrl: string
  similarity: number
  hasClassifications: boolean
}

export interface ISimilarPhoto {
  id: string
  filename: string
  publicSlug: string
  similarity: number
  hasClassifications: boolean
  thumbnailUrl: string
}
