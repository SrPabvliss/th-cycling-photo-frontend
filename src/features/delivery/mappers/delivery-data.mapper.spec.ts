import { describe, expect, it } from 'vitest'

import { toDeliveryData } from './delivery-data.mapper'

const API = {
  token: 't',
  eventName: 'Mama Rumi 2026',
  customerName: 'Ana',
  status: 'active',
  expiresAt: '2026-12-13T00:00:00.000Z',
  downloadCount: 3,
  photos: [
    {
      id: 'p1',
      filename: 'a.jpg',
      downloadUrl: 'https://storage/a',
      fileSize: 1,
      thumbnailUrl: 'https://cdn/t/a',
    },
    { id: 'p2', filename: 'b.jpg', downloadUrl: 'https://storage/b', fileSize: 1 },
  ],
}

describe('toDeliveryData', () => {
  it('keeps the thumbnail of each photo, null when there is none', () => {
    const data = toDeliveryData(API)

    expect(data.photos.map((photo) => photo.thumbnailUrl)).toEqual(['https://cdn/t/a', null])
    expect(data.expiresAt).toEqual(new Date('2026-12-13T00:00:00.000Z'))
  })

  it('leaves the end date out when the api does not give one', () => {
    expect(toDeliveryData({ ...API, expiresAt: null }).expiresAt).toBeNull()
  })
})
