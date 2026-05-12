import { describe, expect, it } from 'vitest'

import { toOperatorRetouchOrdersList } from './operator-retouch-orders.mapper'
import type { IApiOperatorRetouchOrder } from '../types/responses/operator-retouch-orders.response'

const makeApiItems = (): IApiOperatorRetouchOrder[] => [
  {
    orderId: 'order-1',
    buyerName: 'Juan Pérez',
    eventId: 'event-1',
    eventName: 'Vuelta al Ecuador',
    createdAt: '2026-04-10T08:00:00.000Z',
    pendingPhotosCount: 3,
    totalPhotosCount: 5,
    retouchedPhotosCount: 2,
    previewPhotos: [
      {
        photoId: 'ph-1',
        publicSlug: 'slug-1',
        thumbnailUrl: 'https://cdn/t1.jpg',
        filename: 'IMG001.jpg',
      },
      {
        photoId: 'ph-2',
        publicSlug: 'slug-2',
        thumbnailUrl: 'https://cdn/t2.jpg',
        filename: 'IMG002.jpg',
      },
    ],
  },
  {
    orderId: 'order-2',
    buyerName: 'María López',
    eventId: 'event-2',
    eventName: 'Gran Fondo Ambato',
    createdAt: '2026-04-11T09:30:00.000Z',
    pendingPhotosCount: 5,
    totalPhotosCount: 5,
    retouchedPhotosCount: 0,
    previewPhotos: [],
  },
]

describe('toOperatorRetouchOrdersList', () => {
  it('mapea createdAt a instancia de Date', () => {
    const result = toOperatorRetouchOrdersList(makeApiItems())
    result.forEach((order) => {
      expect(order.createdAt).toBeInstanceOf(Date)
    })
  })

  it('preserva el orden de los items', () => {
    const result = toOperatorRetouchOrdersList(makeApiItems())
    expect(result[0]!.orderId).toBe('order-1')
    expect(result[1]!.orderId).toBe('order-2')
  })

  it('copia correctamente las previewPhotos', () => {
    const result = toOperatorRetouchOrdersList(makeApiItems())
    expect(result[0]!.previewPhotos).toHaveLength(2)
    expect(result[0]!.previewPhotos[0]!).toEqual({
      photoId: 'ph-1',
      publicSlug: 'slug-1',
      thumbnailUrl: 'https://cdn/t1.jpg',
      filename: 'IMG001.jpg',
    })
  })

  it('convierte el ISO de createdAt al valor Date correcto', () => {
    const result = toOperatorRetouchOrdersList(makeApiItems())
    expect(result[0]!.createdAt.toISOString()).toBe('2026-04-10T08:00:00.000Z')
  })
})
