import type { EventStatus } from '../types/responses/event-list.response'
import type { IApiEventDetail, IEventDetail } from '../types/responses/event-detail.response'
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
    totalFileSize: api.totalFileSize,
    photoQuota: api.photoQuota,
    photosUploaded: api.photosUploaded,
    createdAt: new Date(api.createdAt),
    updatedAt: new Date(api.updatedAt),
  }
}
