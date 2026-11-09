import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useCartStore } from '@/shared/stores/cart.store'
import type { ICartGroup } from '@/shared/types/cart.types'

function group(eventId: string, photoCount: number): ICartGroup {
  return {
    eventId,
    eventName: `Event ${eventId}`,
    eventSlug: `event-${eventId}`,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-01-01'),
    photos: Array.from({ length: photoCount }, (_, index) => ({
      id: `${eventId}-photo-${index}`,
      publicSlug: `${eventId}-slug-${index}`,
    })),
  }
}

describe('cart store active event', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has no active group until an event is set', () => {
    const store = useCartStore()
    store.setGroups([group('a', 2), group('b', 3)])

    expect(store.activeGroup).toBeNull()
    expect(store.otherGroups).toHaveLength(2)
  })

  it('splits the active group from the rest', () => {
    const store = useCartStore()
    store.setGroups([group('a', 2), group('b', 3)])

    store.setActiveEvent('a')

    expect(store.activeGroup?.eventId).toBe('a')
    expect(store.otherGroups.map((g) => g.eventId)).toEqual(['b'])
  })

  it('reports no active group when the active event has nothing in the cart', () => {
    const store = useCartStore()
    store.setGroups([group('a', 2)])

    store.setActiveEvent('zzz')

    expect(store.activeGroup).toBeNull()
    expect(store.otherGroups.map((g) => g.eventId)).toEqual(['a'])
  })

  it('clears the active event', () => {
    const store = useCartStore()
    store.setGroups([group('a', 2)])
    store.setActiveEvent('a')

    store.setActiveEvent(null)

    expect(store.activeGroup).toBeNull()
  })
})
