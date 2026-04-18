export type ActivityType = 'retouch'

/** API projection from GET /operator/dashboard — already camelCase from backend */
export interface IApiRetouchProgress {
  pendingOrders: number
  pendingPhotos: number
}

export interface IApiActiveEvent {
  eventId: string
  name: string
  date: string
  location: string
  coverUrl: string | null
  retouch: IApiRetouchProgress
}

export interface IApiCompletedEvent {
  eventId: string
  name: string
  location: string
  date: string
  coverUrl: string | null
  totalRetouched: number
  completedAt: string
}

export interface IApiRecentActivity {
  type: string
  eventName: string
  description: string
  timestamp: string
}

export interface IApiDashboardSummary {
  assignedEventsCount: number
  pendingRetouchCount: number
}

export interface IApiOperatorDashboard {
  summary: IApiDashboardSummary
  activeEvents: IApiActiveEvent[]
  completedEvents: IApiCompletedEvent[]
  recentActivity: IApiRecentActivity[]
}

/** Frontend domain types */
export interface IRetouchProgress {
  pendingOrders: number
  pendingPhotos: number
}

export interface IActiveEvent {
  eventId: string
  name: string
  date: Date
  location: string
  coverUrl: string | null
  retouch: IRetouchProgress
}

export interface ICompletedEvent {
  eventId: string
  name: string
  location: string
  date: Date
  coverUrl: string | null
  totalRetouched: number
  completedAt: Date
}

export interface IRecentActivity {
  type: ActivityType
  eventName: string
  description: string
  timestamp: Date
}

export interface IDashboardSummary {
  assignedEventsCount: number
  pendingRetouchCount: number
}

export interface IOperatorDashboard {
  summary: IDashboardSummary
  activeEvents: IActiveEvent[]
  completedEvents: ICompletedEvent[]
  recentActivity: IRecentActivity[]
}
