import { describe, expect, it } from 'vitest'

import { toMyOrderDetail, toMyOrderList } from './my-order.mapper'

describe('toMyOrderList', () => {
  it('maps snapCurrency to currency and keeps the rest', () => {
    const result = toMyOrderList([
      {
        id: 'order-1',
        state: 'ready',
        eventName: 'Vuelta',
        createdAt: '2026-08-01T10:00:00.000Z',
        photoCount: 4,
        subtotal: '12.00',
        snapCurrency: 'USD',
        previewPhotos: [{ photoId: 'p1', galleryUrl: 'https://cdn/gallery/p1.jpg' }],
      },
    ])

    expect(result).toEqual([
      {
        id: 'order-1',
        state: 'ready',
        eventName: 'Vuelta',
        createdAt: '2026-08-01T10:00:00.000Z',
        photoCount: 4,
        subtotal: '12.00',
        currency: 'USD',
        previewPhotos: [{ photoId: 'p1', galleryUrl: 'https://cdn/gallery/p1.jpg' }],
      },
    ])
  })
})

describe('toMyOrderDetail', () => {
  it('carries the server-computed permission flags through untouched', () => {
    const result = toMyOrderDetail({
      id: 'order-1',
      state: 'in_process',
      eventName: 'Vuelta',
      createdAt: '2026-08-01T10:00:00.000Z',
      subtotal: null,
      snapCurrency: null,
      canDownload: false,
      canCancel: true,
      photos: [{ id: 'p1', galleryUrl: 'https://cdn/gallery/p1.jpg' }],
    })

    expect(result.canDownload).toBe(false)
    expect(result.canCancel).toBe(true)
    expect(result.currency).toBeNull()
  })
})
