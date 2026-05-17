import { computed, type Ref } from 'vue'

import { useOperatorReviewQueueQuery } from '@/features/operator/composables/queries/use-operator-review-queue'
import type { TReviewQueueStatusFilter } from '@/features/operator/types/review-queue-status-filter'
import type { IReviewQueueSource } from '@/features/workspace/types/workspace-queue-source.types'
import type { IWorkspaceQueueItem } from '@/features/workspace/types/workspace-queue-item.types'
import { toWorkspaceQueueItemFromOperatorReview } from '../../mappers/operator-review-to-workspace-item.mapper'

export function useOperatorReviewQueueSource(
  eventSlug: Ref<string | null>,
  onlyPending: Ref<boolean>,
): IReviewQueueSource {
  const status = computed<TReviewQueueStatusFilter>(() => (onlyPending.value ? 'pending' : 'all'))
  const queueQuery = useOperatorReviewQueueQuery(eventSlug, status)

  const items = computed<IWorkspaceQueueItem[]>(() =>
    (queueQuery.data.value?.pages ?? []).flatMap((page) =>
      page.items.map(toWorkspaceQueueItemFromOperatorReview),
    ),
  )

  const totalCount = computed(() => {
    const pages = queueQuery.data.value?.pages
    return pages?.[pages.length - 1]?.pagination.total ?? 0
  })

  return {
    items,
    totalCount,
    isPending: computed(() => queueQuery.isPending.value),
    hasNextPage: computed(() => queueQuery.hasNextPage.value ?? false),
    isFetchingNextPage: computed(() => queueQuery.isFetchingNextPage.value),
    fetchNextPage: () => {
      queueQuery.fetchNextPage()
    },
    refetch: () => queueQuery.refetch(),
  }
}
