import { computed, ref, watch, type ComputedRef } from 'vue'

import { useReviewWorkspaceCore } from '@/features/workspace/composables/use-workspace-core'
import type { TRetouchDetailScope } from '../queries/use-operator-retouch-order-detail'
import { useRetouchOrderPhotosSource } from '../queue-sources/use-retouch-order-photos-source'

interface IRetouchOrderRef {
  orderId: string
  buyerName: string
  eventName: string
  pendingPhotosCount: number
}

export type TRetouchWorkspaceMode = 'retouch' | 'review'

export interface IRetouchWorkspaceCoreOptions {
  initialOrderId?: string | null
  orders: ComputedRef<IRetouchOrderRef[]>
}

export function useRetouchWorkspaceCore(options: IRetouchWorkspaceCoreOptions) {
  const orderId = ref<string | null>(options.initialOrderId ?? null)
  const detailScope = ref<TRetouchDetailScope>('pending')
  const photosSource = useRetouchOrderPhotosSource(orderId, detailScope)
  const review = useReviewWorkspaceCore(photosSource, { mode: 'retouch' })

  // Auto-select first FIFO order when none set and orders are loaded.
  watch(
    () => options.orders.value,
    (orders) => {
      if (!orderId.value && orders.length > 0) {
        const first = orders[0]
        if (first) orderId.value = first.orderId
      }
    },
    { immediate: true },
  )

  const workspaceMode = ref<TRetouchWorkspaceMode>('retouch')
  const toggleMode = () => {
    workspaceMode.value = workspaceMode.value === 'retouch' ? 'review' : 'retouch'
  }

  const currentOrder = computed(
    () => options.orders.value.find((o) => o.orderId === orderId.value) ?? null,
  )

  const orderMeta = computed(() =>
    currentOrder.value
      ? {
          orderId: currentOrder.value.orderId,
          buyerName: currentOrder.value.buyerName,
          eventName: currentOrder.value.eventName,
          pendingCount: photosSource.items.value.length,
          totalCount: currentOrder.value.pendingPhotosCount,
        }
      : null,
  )

  const nextOrder = computed(() => {
    const list = options.orders.value
    const idx = list.findIndex((o) => o.orderId === orderId.value)
    return idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null
  })

  interface ICompletedOrderSnapshot {
    orderId: string
    buyerName: string
    eventName: string
    retouchedCount: number
  }

  const orderCompleted = ref(false)
  const completedSnapshot = ref<ICompletedOrderSnapshot | null>(null)
  watch(
    () => photosSource.items.value.length,
    (len, prev) => {
      // Only trigger order-completed when in pending scope; in 'all' scope a
      // zero count just means the operator filtered to a state with no items.
      if (
        detailScope.value === 'pending' &&
        (prev ?? 0) > 0 &&
        len === 0 &&
        orderId.value !== null
      ) {
        const order = currentOrder.value
        completedSnapshot.value = {
          orderId: orderId.value,
          buyerName: order?.buyerName ?? '',
          eventName: order?.eventName ?? '',
          // Total photos retocadas in this session for that order =
          // initial pending count snapshot from the orders list.
          retouchedCount: order?.pendingPhotosCount ?? prev ?? 0,
        }
        orderCompleted.value = true
      }
    },
  )

  const advanceToNextOrder = () => {
    const next = nextOrder.value
    if (next) {
      orderId.value = next.orderId
    } else {
      orderId.value = null
    }
    orderCompleted.value = false
    completedSnapshot.value = null
  }

  const acknowledgeOrderCompleted = () => {
    orderCompleted.value = false
    completedSnapshot.value = null
  }

  return {
    review,
    orderId,
    detailScope,
    workspaceMode,
    toggleMode,
    orderMeta,
    currentOrder,
    nextOrder,
    advanceToNextOrder,
    orderCompleted,
    completedSnapshot,
    acknowledgeOrderCompleted,
    isOrderPhotosPending: photosSource.isPending,
  }
}
