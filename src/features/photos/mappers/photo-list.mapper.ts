import type {
  IApiPhotoListItem,
  IPhotoListItem,
  PhotoStatus,
} from '../types/responses/photo-list.response'

export function toPhotoListItem(api: IApiPhotoListItem): IPhotoListItem {
  return {
    id: api.id,
    publicSlug: api.publicSlug,
    filename: api.filename,
    thumbnailUrl: api.thumbnailUrl,
    status: api.status as PhotoStatus,
    uploadedAt: new Date(api.uploadedAt),
    classifiedAt: api.classifiedAt ? new Date(api.classifiedAt) : null,
  }
}

export function toPhotoListItems(items: IApiPhotoListItem[]): IPhotoListItem[] {
  return items.map(toPhotoListItem)
}
