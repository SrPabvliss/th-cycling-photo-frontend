import { computed, ref, type Ref } from 'vue'

import { useEventRetouchOrdersListSource } from '../queue-sources/use-event-retouch-orders-source'
import { useRetouchWorkspaceCore } from './use-retouch-workspace-core'

export function useEventRetouchWorkspace(
  eventId: Ref<string>,
  options: { initialOrderId?: string; enabled?: Ref<boolean> } = {},
) {
  const enabled = options.enabled ?? ref(true)
  const ordersSource = useEventRetouchOrdersListSource(eventId, ref('pending'), enabled)

  const orders = computed(() =>
    ordersSource.orders.value.map((o) => ({
      orderId: o.orderId,
      buyerName: o.buyerName,
      eventName: o.eventName,
      pendingPhotosCount: o.totalItems - o.retouchedItems,
    })),
  )

  const core = useRetouchWorkspaceCore({
    initialOrderId: enabled.value ? (options.initialOrderId ?? null) : null,
    orders,
  })

  return {
    ...core,
    ordersTotal: ordersSource.total,
    isOrdersPending: ordersSource.isPending,
  }
}
