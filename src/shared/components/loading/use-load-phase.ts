import { computed, toValue, type ComputedRef, type MaybeRefOrGetter, type Ref } from 'vue'

import { useOnline } from '@/core/network/use-online'
import { useDelayedFlag } from './use-delayed-flag'

export interface ILoadPhase {
  /** Loading with network: the skeleton's time (`showSkeleton` once it takes long). */
  isPending: ComputedRef<boolean>
  showSkeleton: Readonly<Ref<boolean>>
  /**
   * There is no network and the load did not finish. vue-query pauses it instead of failing it,
   * so it would stay pending: the screen says it waits for the network (`ErrorState` does, on
   * its own, without network) and the load resumes when it is back.
   */
  isWaitingForNetwork: ComputedRef<boolean>
}

/**
 * Where a load stands, as a screen paints it. The one rule for every load, whether it goes
 * through `LoadBoundary` or draws its own skeleton.
 */
export function useLoadPhase(
  status: MaybeRefOrGetter<'pending' | 'error' | 'success'>,
): ILoadPhase {
  const online = useOnline()
  const isWaitingForNetwork = computed(() => !online.value && toValue(status) !== 'success')
  const isPending = computed(() => toValue(status) === 'pending' && !isWaitingForNetwork.value)
  const showSkeleton = useDelayedFlag(isPending)
  return { isPending, showSkeleton, isWaitingForNetwork }
}
