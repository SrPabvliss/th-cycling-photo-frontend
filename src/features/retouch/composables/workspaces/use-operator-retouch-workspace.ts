import { computed } from 'vue'

import { useOperatorRetouchOrdersListSource } from '../queue-sources/use-retouch-orders-list-source'
import { useRetouchWorkspaceCore } from './use-retouch-workspace-core'

export function useOperatorRetouchWorkspace(options: { initialOrderId?: string } = {}) {
  const ordersSource = useOperatorRetouchOrdersListSource()

  const orders = computed(() =>
    ordersSource.orders.value.map((o) => ({
      orderId: o.orderId,
      buyerName: o.buyerName,
      eventName: o.eventName,
      pendingPhotosCount: o.pendingPhotosCount,
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
