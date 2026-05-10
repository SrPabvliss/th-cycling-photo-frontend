import type {
  IApiOperatorActiveEvent,
  IOperatorActiveEvent,
} from '../types/responses/operator-active-event.response'
import { toEventSummary } from './operator-event-summary.mapper'

export function toOperatorActiveEvent(api: IApiOperatorActiveEvent): IOperatorActiveEvent {
  return {
    event: toEventSummary(api.event),
    stats: {
      review: {
        pendingPhotos: api.stats.review.pendingPhotos,
        totalProcessedPhotos: api.stats.review.totalProcessedPhotos,
      },
      retouch: {
        pendingPhotos: api.stats.retouch.pendingPhotos,
      },
    },
  }
}
