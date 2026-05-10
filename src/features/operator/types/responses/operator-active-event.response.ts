import type { IApiEventSummary, IEventSummary } from './operator-event-summary.response'

export interface IApiOperatorActiveEventReviewStats {
  pendingPhotos: number
  totalProcessedPhotos: number
}

export interface IApiOperatorActiveEventRetouchStats {
  pendingPhotos: number
}

export interface IApiOperatorActiveEventStats {
  review: IApiOperatorActiveEventReviewStats
  retouch: IApiOperatorActiveEventRetouchStats
}

export interface IApiOperatorActiveEvent {
  event: IApiEventSummary
  stats: IApiOperatorActiveEventStats
}

export interface IOperatorActiveEventReviewStats {
  pendingPhotos: number
  totalProcessedPhotos: number
}

export interface IOperatorActiveEventRetouchStats {
  pendingPhotos: number
}

export interface IOperatorActiveEventStats {
  review: IOperatorActiveEventReviewStats
  retouch: IOperatorActiveEventRetouchStats
}

export interface IOperatorActiveEvent {
  event: IEventSummary
  stats: IOperatorActiveEventStats
}
