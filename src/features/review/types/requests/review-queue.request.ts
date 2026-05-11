/** Query string params for `GET /events/:slug/review-queue`. */
export interface IReviewQueueRequest {
  page?: number
  limit?: number
  onlyPending?: boolean
}
