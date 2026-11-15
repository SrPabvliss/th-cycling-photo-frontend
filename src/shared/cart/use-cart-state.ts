import { useQueryClient } from '@tanstack/vue-query'
import { computed, watch, type ComputedRef } from 'vue'

import { useCartStore } from '@/shared/stores/cart.store'
import type { ICartGroup } from '@/shared/types/cart.types'
import { hasServerAnswered, useCartQuery } from './cart-query'

export type CartStatus = 'pending' | 'error' | 'success'

export interface ICartState {
  /**
   * Whether the cart could be read. Only `success` says anything about what is in it: while it is
   * `pending` or `error`, zero photos does not mean an empty cart.
   */
  status: ComputedRef<CartStatus>
  groups: ComputedRef<ICartGroup[]>
  /** A read of the cart is on its way (the first one or a retry). */
  isFetching: ComputedRef<boolean>
  /** Why the last read failed, for the words of the error. */
  error: ComputedRef<unknown>
  totalCount: ComputedRef<number>
  countFor(eventId: string): number
  photoIdsFor(eventId: string): string[]
  isInCart(photoId: string): boolean
  refetch(): Promise<unknown>
}

/**
 * The one way the interface reads the cart. It includes the changes still on their way to the
 * server (see use-cart-actions.ts), so a photo counts as in the cart from the moment it is tapped.
 */
export function useCartState(): ICartState {
  const queryClient = useQueryClient()
  const cartStore = useCartStore()
  const query = useCartQuery(queryClient)
  const answered = hasServerAnswered(queryClient)

  const groups = computed(() => query.data.value ?? [])

  // Checkout and the payment screens still read the cart from the store.
  watch(groups, (current) => cartStore.setGroups(current), { immediate: true })

  const status = computed<CartStatus>(() => {
    if (answered.value) return 'success'
    return query.isError.value ? 'error' : 'pending'
  })

  const photoIds = computed(
    () => new Set(groups.value.flatMap((group) => group.photos.map((photo) => photo.id))),
  )
  const totalCount = computed(() => photoIds.value.size)

  const groupOf = (eventId: string) => groups.value.find((group) => group.eventId === eventId)

  return {
    status,
    groups,
    isFetching: computed(() => query.isFetching.value),
    error: computed(() => query.error.value),
    totalCount,
    countFor: (eventId) => groupOf(eventId)?.photos.length ?? 0,
    photoIdsFor: (eventId) => groupOf(eventId)?.photos.map((photo) => photo.id) ?? [],
    isInCart: (photoId) => photoIds.value.has(photoId),
    refetch: () => query.refetch(),
  }
}
