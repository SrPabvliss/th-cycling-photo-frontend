import { computed, type Ref } from 'vue'

import type { IReviewQueueSource } from '@/features/workspace/types/workspace-queue-source.types'
import { QUEUE_PAGINATION_DEFAULTS } from '../../constants/queue-pagination'
import { useReviewQueueQuery } from '../queries/use-review-queue'

export function useEventReviewQueueSource(
  eventSlug: Ref<string>,
  onlyPending: Ref<boolean>,
): IReviewQueueSource {
  const queueOptions = computed(() => ({
    limit: QUEUE_PAGINATION_DEFAULTS.WORKSPACE_PAGE_SIZE,
    onlyPending: onlyPending.value,
  }))
  const queueQuery = useReviewQueueQuery(eventSlug, queueOptions)

  const items = computed(() => (queueQuery.data.value?.pages ?? []).flatMap((page) => page.items))
  const totalCount = computed(() => {
    const pages = queueQuery.data.value?.pages
    return pages?.[pages.length - 1]?.total ?? 0
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
