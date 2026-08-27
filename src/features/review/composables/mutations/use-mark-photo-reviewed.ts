/**
 * Thin re-export — shared mutation already invalidates operator dashboard,
 * review-queue cache, photo keys, and EVENTS/review keys via API_ROUTES.
 */
export {
  useMarkPhotoReviewed,
  type IMarkPhotoReviewedVariables,
} from '@/shared/workspace/composables/use-mark-photo-reviewed'
