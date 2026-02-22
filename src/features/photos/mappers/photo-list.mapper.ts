import { getPhotoUrl } from '@/shared/utils/cdn.utils'

import type {
  IApiPhotoListItem,
  IPhotoListItem,
  PhotoStatus,
} from '../types/responses/photo-list.response'

export function toPhotoListItem(api: IApiPhotoListItem): IPhotoListItem {
  return {
    id: api.id,
    eventId: api.eventId,
    filename: api.filename,
    thumbnailUrl: getPhotoUrl(api.storageKey),
    status: api.status as PhotoStatus,
    width: api.width,
    height: api.height,
    uploadedAt: new Date(api.uploadedAt),
  }
}

export function toPhotoListItems(items: IApiPhotoListItem[]): IPhotoListItem[] {
  return items.map(toPhotoListItem)
}
