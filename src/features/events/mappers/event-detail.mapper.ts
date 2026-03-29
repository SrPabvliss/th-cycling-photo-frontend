import type { CoverImageSource, EventStatus } from '../types/responses/event-list.response'
import type { IApiEventDetail, IEventDetail } from '../types/responses/event-detail.response'
import { parseDateOnly } from '@/shared/utils/date.utils'

export function toEventDetail(api: IApiEventDetail): IEventDetail {
  return {
    id: api.id,
    name: api.name,
    description: api.description,
    date: parseDateOnly(api.date),
    location: api.location,
    provinceName: api.provinceName,
    cantonName: api.cantonName,
    provinceId: api.provinceId,
    cantonId: api.cantonId,
    coverImageUrl: api.coverImageUrl,
    coverImageSource: api.coverImageSource as CoverImageSource | null,
    status: api.status as EventStatus,
    isFeatured: api.isFeatured,
    photoCount: api.photoCount,
    classifiedCount: api.classifiedCount,
    totalFileSize: api.totalFileSize,
    createdAt: new Date(api.createdAt),
    updatedAt: new Date(api.updatedAt),
  }
}
