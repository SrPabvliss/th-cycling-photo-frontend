import { computed, ref, type Ref } from 'vue'

import type {
  IOperatorRetouchOrder,
  TRetouchOrderScope,
} from '../../types/responses/operator-retouch-orders.response'
import { useOperatorRetouchOrdersInfiniteQuery } from '../queries/use-operator-retouch-orders'

export function useOperatorRetouchOrdersListSource(
  scope: Ref<TRetouchOrderScope> = ref('pending'),
  eventSlug: Ref<string | null> = ref(null),
) {
  const query = useOperatorRetouchOrdersInfiniteQuery(scope, eventSlug)

  const orders = computed<IOperatorRetouchOrder[]>(
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
    eventSlug,
    isPending: computed(() => query.isPending.value),
    hasNextPage: computed(() => query.hasNextPage.value ?? false),
    isFetchingNextPage: computed(() => query.isFetchingNextPage.value),
    fetchNextPage: () => {
      query.fetchNextPage()
    },
    refetch: () => query.refetch(),
  }
}
