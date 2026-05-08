import type { PhotoStatus } from '@/shared/types/photo-enums'
import type { IApiPhotoListItem, IPhotoListItem } from '../types/responses/photo-list.response'

export function toPhotoListItem(api: IApiPhotoListItem): IPhotoListItem {
  return {
    id: api.id,
    publicSlug: api.publicSlug,
    filename: api.filename,
    thumbnailUrl: api.thumbnailUrl,
    status: api.status as PhotoStatus,
    uploadedAt: new Date(api.uploadedAt),
    reviewedAt: api.reviewedAt ? new Date(api.reviewedAt) : null,
  }
}

export function toPhotoListItems(items: IApiPhotoListItem[]): IPhotoListItem[] {
  return items.map(toPhotoListItem)
}
