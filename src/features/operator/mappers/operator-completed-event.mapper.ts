import type {
  IApiOperatorCompletedEvent,
  IOperatorCompletedEvent,
} from '../types/responses/operator-completed-event.response'
import { toEventSummary } from './operator-event-summary.mapper'

export function toOperatorCompletedEvent(api: IApiOperatorCompletedEvent): IOperatorCompletedEvent {
  return {
    event: toEventSummary(api.event),
    stats: {
      totalRetouched: api.stats.totalRetouched,
      completedAt: api.stats.completedAt ? new Date(api.stats.completedAt) : null,
    },
  }
}
