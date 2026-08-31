import type { IApiEventAsset, IEventAsset } from '../types/responses/event-asset.response'

export function toEventAsset(api: IApiEventAsset): IEventAsset {
  return {
    id: api.id,
    assetType: api.assetType,
    url: api.url,
    fileSize: api.fileSize,
    mimeType: api.mimeType,
    focalX: api.focalX,
    focalY: api.focalY,
    uploadedAt: new Date(api.uploadedAt),
  }
}
