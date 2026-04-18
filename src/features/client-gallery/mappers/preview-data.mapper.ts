import type {
  IApiPreviewData,
  IApiPreviewPhoto,
  IPreviewData,
  IPreviewPhoto,
  PreviewStatus,
} from '../types/responses/preview-data.response'

function toPreviewPhoto(api: IApiPreviewPhoto): IPreviewPhoto {
  return {
    id: api.id,
    url: api.url,
  }
}

export function toPreviewData(api: IApiPreviewData): IPreviewData {
  return {
    token: api.token,
    eventName: api.eventName,
    eventDate: new Date(api.eventDate),
    status: api.status as PreviewStatus,
    expiresAt: new Date(api.expiresAt),
    photos: api.photos.map(toPreviewPhoto),
  }
}
