import { computed, ref, type Ref } from 'vue'

import type {
  IOperatorRetouchOrder,
  TRetouchOrderScope,
} from '../../types/responses/operator-retouch-orders.response'
import { useOperatorRetouchOrdersQuery } from '../queries/use-operator-retouch-orders'

export function useOperatorRetouchOrdersListSource(
  page: Ref<number> = ref(1),
  limit: Ref<number> = ref(20),
  scope: Ref<TRetouchOrderScope> = ref('pending'),
  eventSlug: Ref<string | null> = ref(null),
) {
  const query = useOperatorRetouchOrdersQuery(page, limit, scope, eventSlug)

  const orders = computed<IOperatorRetouchOrder[]>(() => query.data.value?.items ?? [])
  const total = computed(() => query.data.value?.total ?? 0)
  const totalPages = computed(() => query.data.value?.totalPages ?? 1)

  return {
    orders,
    total,
    totalPages,
    page,
    limit,
    scope,
    eventSlug,
    isPending: computed(() => query.isPending.value),
    isFetching: computed(() => query.isFetching.value),
    refetch: () => query.refetch(),
  }
}
