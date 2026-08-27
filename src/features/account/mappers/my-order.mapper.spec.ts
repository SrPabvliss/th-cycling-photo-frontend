import { describe, expect, it } from 'vitest'

import { toMyOrderDetail, toMyOrderList } from './my-order.mapper'

describe('my-order.mapper', () => {
  it('renames snapCurrency → currency and preserves permission flags', () => {
    const list = toMyOrderList([
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
    expect(list[0]!.currency).toBe('USD')

    const detail = toMyOrderDetail({
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
    expect(detail.canDownload).toBe(false)
    expect(detail.canCancel).toBe(true)
    expect(detail.currency).toBeNull()
  })
})
