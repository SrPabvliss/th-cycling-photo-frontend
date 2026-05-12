import { describe, expect, it } from 'vitest'

import { toRetouchQueueOrders } from './operator-retouch-queue.mapper'
import type { IApiRetouchQueueOrder } from '../types/responses/operator-retouch-queue.response'

const makeApiOrder = (overrides?: Partial<IApiRetouchQueueOrder>): IApiRetouchQueueOrder => ({
  orderId: 'order-1',
  buyerName: 'Carlos Ruiz',
  eventId: 'event-abc',
  eventName: 'Ciclismo Andino',
  createdAt: '2026-05-01T10:00:00.000Z',
  totalItems: 4,
  retouchedItems: 2,
  items: [
    {
      photoId: 'ph-1',
      publicSlug: 'slug-1',
      thumbnailUrl: 'https://cdn/t1.jpg',
      isRetouched: false,
    },
    {
      photoId: 'ph-2',
      publicSlug: 'slug-2',
      thumbnailUrl: 'https://cdn/t2.jpg',
      isRetouched: true,
    },
  ],
  ...overrides,
})

describe('toRetouchQueueOrders', () => {
  it('mapea eventId correctamente', () => {
    const result = toRetouchQueueOrders([makeApiOrder()])
    expect(result[0]!.eventId).toBe('event-abc')
  })

  it('mapea eventName correctamente', () => {
    const result = toRetouchQueueOrders([makeApiOrder()])
    expect(result[0]!.eventName).toBe('Ciclismo Andino')
  })

  it('mapea createdAt a instancia de Date', () => {
    const result = toRetouchQueueOrders([makeApiOrder()])
    expect(result[0]!.createdAt).toBeInstanceOf(Date)
    expect(result[0]!.createdAt.toISOString()).toBe('2026-05-01T10:00:00.000Z')
  })

  it('mapea los items del pedido', () => {
    const result = toRetouchQueueOrders([makeApiOrder()])
    expect(result[0]!.items).toHaveLength(2)
    expect(result[0]!.items[0]!.photoId).toBe('ph-1')
    expect(result[0]!.items[1]!.isRetouched).toBe(true)
  })

  it('mapea múltiples órdenes preservando el orden', () => {
    const orders = [makeApiOrder({ orderId: 'o-1' }), makeApiOrder({ orderId: 'o-2' })]
    const result = toRetouchQueueOrders(orders)
    expect(result[0]!.orderId).toBe('o-1')
    expect(result[1]!.orderId).toBe('o-2')
  })
})
