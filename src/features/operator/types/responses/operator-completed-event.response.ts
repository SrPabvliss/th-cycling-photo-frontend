import type { IApiEventSummary, IEventSummary } from './operator-event-summary.response'

export interface IApiOperatorCompletedEventStats {
  totalRetouched: number
  completedAt: string | null
}

export interface IApiOperatorCompletedEvent {
  event: IApiEventSummary
  stats: IApiOperatorCompletedEventStats
}

export interface IOperatorCompletedEventStats {
  totalRetouched: number
  completedAt: Date | null
}

export interface IOperatorCompletedEvent {
  event: IEventSummary
  stats: IOperatorCompletedEventStats
}
