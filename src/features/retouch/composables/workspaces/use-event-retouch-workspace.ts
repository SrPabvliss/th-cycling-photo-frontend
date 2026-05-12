import { computed, type Ref } from 'vue'

import { useEventRetouchOrdersListSource } from '../queue-sources/use-event-retouch-orders-source'
import { useRetouchWorkspaceCore } from './use-retouch-workspace-core'

export function useEventRetouchWorkspace(
  eventId: Ref<string>,
  options: { initialOrderId?: string } = {},
) {
  const ordersSource = useEventRetouchOrdersListSource(eventId)

  const orders = computed(() =>
    ordersSource.orders.value.map((o) => ({
      orderId: o.orderId,
      buyerName: o.buyerName,
      eventName: o.eventName,
      pendingPhotosCount: o.totalItems - o.retouchedItems,
    })),
  )

  const core = useRetouchWorkspaceCore({
    initialOrderId: options.initialOrderId ?? null,
    orders,
  })

  return {
    ...core,
    ordersTotal: ordersSource.total,
    isOrdersPending: ordersSource.isPending,
  }
}
