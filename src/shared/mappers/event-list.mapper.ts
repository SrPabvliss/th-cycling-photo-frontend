import { parseDateOnly } from '@/shared/utils/date.utils'
import type {
  EventStatus,
  IApiEventListItem,
  IEventListItem,
} from '@/shared/types/event.types'

export function toEventListItem(api: IApiEventListItem): IEventListItem {
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    startDate: parseDateOnly(api.startDate),
    endDate: parseDateOnly(api.endDate),
    provinceName: api.provinceName,
    cantonName: api.cantonName,
    coverImageUrl: api.coverImageUrl,
    coverImageSlug: api.coverImageSlug,
    status: api.status as EventStatus,
    isFrozen: api.isFrozen,
    photoCount: api.photoCount,
    totalFileSize: api.totalFileSize,
    organizerId: api.organizerId,
    organizerName: api.organizerName,
    photoQuota: api.photoQuota,
    photosUploaded: api.photosUploaded,
    reviewedCount: api.reviewedCount,
    categorizedCount: api.categorizedCount,
    revenue: api.revenue,
    paidCount: api.paidCount,
    deliveredCount: api.deliveredCount,
    giftedCount: api.giftedCount,
    unpaidCount: api.unpaidCount,
    cancelledCount: api.cancelledCount,
    lastUploadAt: api.lastUploadAt ? new Date(api.lastUploadAt) : null,
    isArchived: api.isArchived,
    alert: api.alert,
  }
}

export function toEventListItems(items: IApiEventListItem[]): IEventListItem[] {
  return items.map(toEventListItem)
}
