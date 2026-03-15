export interface IApiSimilarPhoto {
  id: string
  filename: string
  storageKey: string
  similarity: number
  hasClassifications: boolean
}

export interface ISimilarPhoto {
  id: string
  filename: string
  storageKey: string
  similarity: number
  hasClassifications: boolean
  thumbnailUrl: string
}
