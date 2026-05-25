import type { QueryClient } from '@tanstack/vue-query'

import { API_ROUTES } from '@/core/api/api-routes'
import type { IOperatorReviewQueueItem } from '@/features/operator/types/responses/operator-review-queue-item.response'

interface IPaginationSnapshot {
  total: number
  [key: string]: unknown
}

interface IInfinitePage {
  items: IOperatorReviewQueueItem[]
  pagination: IPaginationSnapshot
}

interface IInfiniteData {
  pages: IInfinitePage[]
  pageParams: unknown[]
}

export function removePhotoFromReviewQueueCache(
  queryClient: QueryClient,
  publicSlug: string,
): void {
  const operatorBase = API_ROUTES.OPERATOR.BASE
  queryClient.setQueriesData<IInfiniteData>(
    { queryKey: [operatorBase, 'dashboard', 'review-queue'] },
    (old) => {
      if (!old) return old
      let removedAcrossPages = 0
      const pages = old.pages.map((p) => {
        const filtered = p.items.filter((it) => {
          if (it.publicSlug === publicSlug) {
            removedAcrossPages++
            return false
          }
          return true
        })
        return { ...p, items: filtered }
      })
      if (removedAcrossPages === 0) return old
      const pagesWithUpdatedTotals = pages.map((p) => ({
        ...p,
        pagination: {
          ...p.pagination,
          total: Math.max(0, p.pagination.total - 1),
        },
      }))
      return { ...old, pages: pagesWithUpdatedTotals }
    },
  )
}
