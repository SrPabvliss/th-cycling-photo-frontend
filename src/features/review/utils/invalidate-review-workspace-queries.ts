import type { QueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import { OPERATOR_QUERY_KEYS } from '@/features/operator/constants/operator-query-keys'
import { PHOTO_QUERY_KEYS } from '@/features/photos/constants/query-keys'
import { REVIEW_QUERY_KEYS } from '../constants/query-keys'

interface IInvalidateContext {
  eventSlug?: string
  photoSlug?: string
}

/**
 * Invalidates all caches that may have changed after a review-related
 * mutation (mark reviewed, bib/color correction, add bib/color). Centralizes
 * cross-feature invalidation so individual mutations only call this util.
 */
export function invalidateReviewWorkspaceQueries(
  queryClient: QueryClient,
  context: IInvalidateContext = {},
): void {
  const operatorBase = API_ROUTES.OPERATOR.BASE

  // Operator dashboard surfaces (prefix match: covers all paginations / variants)
  queryClient.invalidateQueries({ queryKey: OPERATOR_QUERY_KEYS.dashboardSummary() })
  queryClient.invalidateQueries({ queryKey: [operatorBase, 'dashboard', 'events', 'active'] })
  queryClient.invalidateQueries({ queryKey: [operatorBase, 'dashboard', 'recent-activity'] })
  queryClient.invalidateQueries({ queryKey: [operatorBase, 'dashboard', 'review-queue'] })

  // Per-event review queue
  if (context.eventSlug) {
    queryClient.invalidateQueries({
      queryKey: REVIEW_QUERY_KEYS.queue(context.eventSlug, true),
    })
    queryClient.invalidateQueries({
      queryKey: REVIEW_QUERY_KEYS.queue(context.eventSlug, false),
    })
  } else {
    queryClient.invalidateQueries({ queryKey: REVIEW_QUERY_KEYS.all() })
  }

  // Photo detail (specific slug if available, otherwise broad photo invalidation)
  if (context.photoSlug) {
    queryClient.invalidateQueries({
      queryKey: PHOTO_QUERY_KEYS.detailBySlug(context.photoSlug),
    })
  }
  queryClient.invalidateQueries({ queryKey: PHOTO_QUERY_KEYS.all() })
}
