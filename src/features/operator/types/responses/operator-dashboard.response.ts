export type ActivityType = 'classification' | 'retouch'

/** API projection from GET /operator/dashboard — already camelCase from backend */
export interface IApiClassificationProgress {
  total: number
  classified: number
  percentage: number
}

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
  classification: IApiClassificationProgress
  retouch: IApiRetouchProgress
  hasProgress: boolean
}

export interface IApiCompletedEvent {
  eventId: string
  name: string
  location: string
  date: string
  coverUrl: string | null
  totalClassified: number
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
  pendingPhotosCount: number
  pendingRetouchCount: number
}

export interface IApiOperatorDashboard {
  summary: IApiDashboardSummary
  activeEvents: IApiActiveEvent[]
  completedEvents: IApiCompletedEvent[]
  recentActivity: IApiRecentActivity[]
}

/** Frontend domain types */
export interface IClassificationProgress {
  total: number
  classified: number
  percentage: number
}

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
  classification: IClassificationProgress
  retouch: IRetouchProgress
  hasProgress: boolean
}

export interface ICompletedEvent {
  eventId: string
  name: string
  location: string
  date: Date
  coverUrl: string | null
  totalClassified: number
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
  pendingPhotosCount: number
  pendingRetouchCount: number
}

export interface IOperatorDashboard {
  summary: IDashboardSummary
  activeEvents: IActiveEvent[]
  completedEvents: ICompletedEvent[]
  recentActivity: IRecentActivity[]
}
