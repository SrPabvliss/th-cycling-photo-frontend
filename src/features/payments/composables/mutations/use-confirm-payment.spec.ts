import { setActivePinia, createPinia } from 'pinia'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { CART_QUERY_KEYS } from '@/shared/constants/cart-query-keys'
import { useCartStore } from '@/shared/stores/cart.store'
import { useConfirmPayment } from './use-confirm-payment'

const invalidateQueries = vi.fn()

vi.mock('@/core/http/axios-client', () => ({
  httpClient: { post: vi.fn() },
}))
vi.mock('@tanstack/vue-query', () => ({
  useMutation: (options: unknown) => options,
  useQueryClient: () => ({ invalidateQueries }),
}))

type Confirm = { onSuccess: (result: { approved: boolean; settled: boolean }) => void }

describe('useConfirmPayment', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    invalidateQueries.mockClear()
  })

  it('drops the cart once the charge settles, because that is when the server converts it', () => {
    const store = useCartStore()
    store.setGroups([{ eventId: 'event-1', eventName: 'E', photos: [{ id: 'photo-1' }] }] as never)
    ;(useConfirmPayment() as unknown as Confirm).onSuccess({ approved: true, settled: true })

    expect(store.totalCount).toBe(0)
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: CART_QUERY_KEYS.cart() })
  })

  it('keeps the cart when the charge is declined, so the buyer can retry with the same photos', () => {
    const store = useCartStore()
    store.setGroups([{ eventId: 'event-1', eventName: 'E', photos: [{ id: 'photo-1' }] }] as never)
    ;(useConfirmPayment() as unknown as Confirm).onSuccess({ approved: false, settled: false })

    expect(store.totalCount).toBe(1)
    expect(invalidateQueries).not.toHaveBeenCalled()
  })

  it('keeps the cart when an approved charge did not settle, because no order was handed over', () => {
    const store = useCartStore()
    store.setGroups([{ eventId: 'event-1', eventName: 'E', photos: [{ id: 'photo-1' }] }] as never)
    ;(useConfirmPayment() as unknown as Confirm).onSuccess({ approved: true, settled: false })

    expect(store.totalCount).toBe(1)
    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})
