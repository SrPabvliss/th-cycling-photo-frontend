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
      invoice: null,
      billing: null,
    })
    expect(detail.canDownload).toBe(false)
    expect(detail.canCancel).toBe(true)
    expect(detail.currency).toBeNull()
  })

  it('maps the invoice of my order', () => {
    const base = {
      id: 'order-1',
      state: 'ready' as const,
      eventName: 'Vuelta',
      createdAt: '2026-08-01T10:00:00.000Z',
      subtotal: '12.00',
      snapCurrency: 'USD',
      canDownload: true,
      canCancel: false,
      photos: [],
    }
    const billing = {
      idType: 'national_id' as const,
      idNumber: '1710034065',
      legalName: 'Juan Pérez',
      email: 'juan@correo.com',
      address: null,
    }

    const withInvoice = toMyOrderDetail({
      ...base,
      billing,
      invoice: {
        state: 'rejected',
        rejectionMessages: ['RUC no existe'],
        canCorrect: true,
        documents: [
          {
            id: 'doc-1',
            type: 'invoice',
            state: 'returned',
            number: '001-001-000000001',
            issueDate: '2026-08-01',
            downloadable: false,
            current: true,
          },
        ],
      },
    })
    expect(withInvoice.invoice?.canCorrect).toBe(true)
    expect(withInvoice.invoice?.documents[0]!.id).toBe('doc-1')
    expect(withInvoice.billing).toEqual(billing)

    const without = toMyOrderDetail({ ...base, billing: null, invoice: null })
    expect(without.invoice).toBeNull()
    expect(without.billing).toBeNull()
  })
})
