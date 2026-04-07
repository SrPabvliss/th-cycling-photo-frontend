import { parseDateOnly } from '@/shared/utils/date.utils'
import type {
  ActivityType,
  IApiActiveEvent,
  IApiCompletedEvent,
  IApiOperatorDashboard,
  IApiRecentActivity,
  IActiveEvent,
  ICompletedEvent,
  IOperatorDashboard,
  IRecentActivity,
} from '../types/responses/operator-dashboard.response'

function toActiveEvent(api: IApiActiveEvent): IActiveEvent {
  return {
    eventId: api.eventId,
    name: api.name,
    date: parseDateOnly(api.date),
    location: api.location,
    coverUrl: api.coverUrl,
    classification: {
      total: api.classification.total,
      classified: api.classification.classified,
      percentage: api.classification.percentage,
    },
    retouch: {
      pendingOrders: api.retouch.pendingOrders,
      pendingPhotos: api.retouch.pendingPhotos,
    },
    hasProgress: api.hasProgress,
  }
}

function toCompletedEvent(api: IApiCompletedEvent): ICompletedEvent {
  return {
    eventId: api.eventId,
    name: api.name,
    location: api.location,
    date: parseDateOnly(api.date),
    coverUrl: api.coverUrl,
    totalClassified: api.totalClassified,
    completedAt: new Date(api.completedAt),
  }
}

function toRecentActivity(api: IApiRecentActivity): IRecentActivity {
  return {
    type: api.type as ActivityType,
    eventName: api.eventName,
    description: api.description,
    timestamp: new Date(api.timestamp),
  }
}

export function toOperatorDashboard(api: IApiOperatorDashboard): IOperatorDashboard {
  return {
    summary: {
      assignedEventsCount: api.summary.assignedEventsCount,
      pendingPhotosCount: api.summary.pendingPhotosCount,
      pendingRetouchCount: api.summary.pendingRetouchCount,
    },
    activeEvents: api.activeEvents.map(toActiveEvent),
    completedEvents: api.completedEvents.map(toCompletedEvent),
    recentActivity: api.recentActivity.map(toRecentActivity),
  }
}
