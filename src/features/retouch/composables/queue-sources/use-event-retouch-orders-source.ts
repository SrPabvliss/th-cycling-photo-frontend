import { computed, ref, type Ref } from 'vue'

import { useEventRetouchOrdersQuery } from '../queries/use-event-retouch-orders'
import type { IRetouchQueueOrder } from '../../types/responses/operator-retouch-queue.response'
import type { TRetouchOrderScope } from '../../types/responses/operator-retouch-orders.response'

export function useEventRetouchOrdersListSource(
  eventId: Ref<string>,
  scope: Ref<TRetouchOrderScope> = ref('pending'),
) {
  const query = useEventRetouchOrdersQuery(eventId, scope)

  const orders = computed<IRetouchQueueOrder[]>(() => query.data.value ?? [])
  const total = computed(() => orders.value.length)

  return {
    orders,
    total,
    scope,
    isPending: computed(() => query.isPending.value),
    isFetching: computed(() => query.isFetching.value),
    refetch: () => query.refetch(),
  }
}
