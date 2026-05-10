import type {
  IApiRecentActivity,
  IRecentActivity,
} from '../types/responses/operator-recent-activity.response'

export function toRecentActivity(api: IApiRecentActivity): IRecentActivity {
  return {
    id: api.id,
    type: api.type,
    eventId: api.eventId,
    eventName: api.eventName,
    count: api.count,
    description: api.description,
    timestamp: new Date(api.timestamp),
  }
}
