export const REVIEW_QUEUE_STATUS_FILTERS = ['all', 'pending', 'reviewed'] as const

export type TReviewQueueStatusFilter = (typeof REVIEW_QUEUE_STATUS_FILTERS)[number]
