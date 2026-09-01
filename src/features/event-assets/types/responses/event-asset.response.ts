import type { EventAssetType } from '../asset-type'

/** API projection from GET /events/:eventId/assets */
export interface IApiEventAsset {
  id: string
  assetType: EventAssetType
  url: string
  fileSize: number | null
  mimeType: string | null
  focalX: number
  focalY: number
  uploadedAt: string
}

/** Frontend domain type */
export interface IEventAsset {
  id: string
  assetType: EventAssetType
  url: string
  fileSize: number | null
  mimeType: string | null
  focalX: number
  focalY: number
  uploadedAt: Date
}
