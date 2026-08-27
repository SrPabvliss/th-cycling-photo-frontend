import { computed, ref, type Ref } from 'vue'

import { useEventRetouchOrdersInfiniteQuery } from '../queries/use-event-retouch-orders'
import type { IRetouchQueueOrder } from '../../types/responses/operator-retouch-queue.response'
import type { TRetouchOrderScope } from '../../types/responses/operator-retouch-orders.response'

export function useEventRetouchOrdersListSource(
  eventSlug: Ref<string>,
  scope: Ref<TRetouchOrderScope> = ref('pending'),
  enabled: Ref<boolean> = ref(true),
) {
  const query = useEventRetouchOrdersInfiniteQuery(eventSlug, scope, enabled)

  const orders = computed<IRetouchQueueOrder[]>(
    () => query.data.value?.pages.flatMap((p) => p.items) ?? [],
  )
  const total = computed(() => {
    const pages = query.data.value?.pages
    return pages?.[pages.length - 1]?.pagination.total ?? 0
  })

  return {
    orders,
    total,
    scope,
    isPending: computed(() => query.isPending.value),
    hasNextPage: computed(() => query.hasNextPage.value ?? false),
    isFetchingNextPage: computed(() => query.isFetchingNextPage.value),
    fetchNextPage: () => {
      query.fetchNextPage()
    },
    refetch: () => query.refetch(),
  }
}
