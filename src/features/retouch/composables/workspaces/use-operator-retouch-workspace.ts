import { computed, ref, type Ref } from 'vue'

import { useOperatorRetouchOrdersListSource } from '../queue-sources/use-retouch-orders-list-source'
import { useRetouchWorkspaceCore } from './use-retouch-workspace-core'

export function useOperatorRetouchWorkspace(
  options: { initialOrderId?: string; enabled?: Ref<boolean> } = {},
) {
  const enabled = options.enabled ?? ref(true)
  const ordersSource = useOperatorRetouchOrdersListSource(ref('pending'), ref(null), enabled)

  const orders = computed(() =>
    ordersSource.orders.value.map((o) => ({
      orderId: o.orderId,
      buyerName: o.buyerName,
      eventName: o.eventName,
      pendingPhotosCount: o.pendingPhotosCount,
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
