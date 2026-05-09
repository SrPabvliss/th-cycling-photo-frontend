import { describe, expect, it } from 'vitest'
import type { IApiPhotoDetail } from '../types/responses/photo-detail.response'
import { toPhotoDetail } from './photo-detail.mapper'

const baseApi: IApiPhotoDetail = {
  id: 'p1',
  eventId: 'e1',
  eventSlug: 'evt',
  filename: 'IMG.jpg',
  publicSlug: 'pub',
  imageUrl: 'https://w/IMG.jpg',
  thumbnailUrl: 'https://t/IMG.jpg',
  fileSize: 1234,
  mimeType: 'image/jpeg',
  width: 1920,
  height: 1080,
  status: 'processed',
  retouchedImageUrl: null,
  retouchedFileSize: null,
  retouchedAt: null,
  capturedAt: null,
  uploadedAt: '2026-05-01T00:00:00Z',
  processedAt: '2026-05-01T00:01:00Z',
  reviewedAt: null,
  bibs: [],
  colors: [],
}

describe('toPhotoDetail', () => {
  it('maps empty bibs/colors arrays', () => {
    const result = toPhotoDetail(baseApi)
    expect(result.bibs).toEqual([])
    expect(result.colors).toEqual([])
  })

  it('maps each bib field through', () => {
    const result = toPhotoDetail({
      ...baseApi,
      bibs: [
        {
          id: 'b1',
          digits: '20',
          status: 'read',
          confidence: 0.95,
          source: 'ai',
          cropUrl: 'https://signed/crops/bibs/0.jpg?sig=x',
        },
      ],
    })
    expect(result.bibs).toEqual([
      {
        id: 'b1',
        digits: '20',
        status: 'matched',
        confidence: 0.95,
        source: 'ai',
        cropUrl: 'https://signed/crops/bibs/0.jpg?sig=x',
      },
    ])
  })

  it('maps each color field through', () => {
    const result = toPhotoDetail({
      ...baseApi,
      colors: [
        {
          id: 'c1',
          region: 'helmet',
          primaryColor: 'rojo',
          secondaryColor: 'blanco',
          confidence: 0.9,
          source: 'ai',
          cropUrl: 'https://signed/crops/colors/helmet/0.jpg',
        },
      ],
    })
    expect(result.colors).toEqual([
      {
        id: 'c1',
        region: 'helmet',
        primaryColor: 'rojo',
        secondaryColor: 'blanco',
        confidence: 0.9,
        source: 'ai',
        cropUrl: 'https://signed/crops/colors/helmet/0.jpg',
      },
    ])
  })

  it('preserves null cropUrl', () => {
    const result = toPhotoDetail({
      ...baseApi,
      bibs: [
        {
          id: 'b1',
          digits: '20',
          status: null,
          confidence: null,
          source: 'ai',
          cropUrl: null,
        },
      ],
    })
    expect(result.bibs[0]!.cropUrl).toBeNull()
  })
})
