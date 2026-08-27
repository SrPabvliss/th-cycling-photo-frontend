import type { EventStatus, IApiEventDetail, IEventDetail } from '@/shared/types/event.types'
import { parseDateOnly } from '@/shared/utils/date.utils'

export function toEventDetail(api: IApiEventDetail): IEventDetail {
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    startDate: parseDateOnly(api.startDate),
    endDate: parseDateOnly(api.endDate),
    provinceName: api.provinceName,
    cantonName: api.cantonName,
    provinceId: api.provinceId,
    cantonId: api.cantonId,
    coverImageUrl: api.coverImageUrl,
    coverImageSlug: api.coverImageSlug,
    status: api.status as EventStatus,
    photoCount: api.photoCount,
    classifiedCount: api.classifiedCount,
    categorizedCount: api.categorizedCount,
    totalFileSize: api.totalFileSize,
    photoQuota: api.photoQuota,
    photosUploaded: api.photosUploaded,
    isFrozen: api.isFrozen,
    frozenAt: api.frozenAt ? new Date(api.frozenAt) : null,
    organizerName: api.organizerName,
    eventTypeName: api.eventTypeName,
    contractName: api.contractName,
    reviewedCount: api.reviewedCount,
    lastUploadAt: api.lastUploadAt ? new Date(api.lastUploadAt) : null,
    revenue: api.revenue,
    ordersCount: api.ordersCount,
    soldPhotoCount: api.soldPhotoCount,
    createdAt: new Date(api.createdAt),
    updatedAt: new Date(api.updatedAt),
  }
}
