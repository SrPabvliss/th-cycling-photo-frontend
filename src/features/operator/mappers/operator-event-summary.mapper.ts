import { parseDateOnly } from '@/shared/utils/date.utils'
import type {
  IApiEventSummary,
  IEventSummary,
} from '../types/responses/operator-event-summary.response'

export function toEventSummary(api: IApiEventSummary): IEventSummary {
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    date: parseDateOnly(api.date),
    location: api.location,
    coverUrl: api.coverUrl,
    totalPhotos: api.totalPhotos,
  }
}
