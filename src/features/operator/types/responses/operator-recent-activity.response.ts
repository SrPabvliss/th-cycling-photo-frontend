import type { ActivityType } from '../operator-activity.types'

export interface IApiRecentActivity {
  id: string
  type: ActivityType
  eventId: string
  eventName: string
  count: number
  description: string
  timestamp: string
}

export interface IRecentActivity {
  id: string
  type: ActivityType
  eventId: string
  eventName: string
  count: number
  description: string
  timestamp: Date
}
