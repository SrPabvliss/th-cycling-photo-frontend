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
          digitsOriginal: '20',
          wasCorrected: false,
          correctedAt: null,
        },
      ],
    })
    expect(result.bibs).toEqual([
      {
        id: 'b1',
        digits: '20',
        status: 'read',
        confidence: 0.95,
        source: 'ai',
        cropUrl: 'https://signed/crops/bibs/0.jpg?sig=x',
        digitsOriginal: '20',
        wasCorrected: false,
        correctedAt: null,
      },
    ])
  })

  it('maps wasCorrected and digitsOriginal on bibs', () => {
    const result = toPhotoDetail({
      ...baseApi,
      bibs: [
        {
          id: 'b-1',
          digits: '42',
          digitsOriginal: '24',
          wasCorrected: true,
          correctedAt: '2026-05-09T10:00:00Z',
          status: 'read',
          confidence: 0.9,
          source: 'reviewer',
          cropUrl: null,
        },
      ],
    })
    expect(result.bibs[0]!.digits).toBe('42')
    expect(result.bibs[0]!.digitsOriginal).toBe('24')
    expect(result.bibs[0]!.wasCorrected).toBe(true)
    expect(result.bibs[0]!.correctedAt).toBeInstanceOf(Date)
  })

  it('maps color correction-tracking fields', () => {
    const result = toPhotoDetail({
      ...baseApi,
      colors: [
        {
          id: 'c-1',
          region: 'helmet',
          primaryColor: 'rojo',
          secondaryColor: 'blanco',
          primaryColorOriginal: 'azul',
          primaryWasCorrected: true,
          secondaryColorOriginal: 'blanco',
          secondaryWasCorrected: false,
          confidence: 0.8,
          source: 'reviewer',
          cropUrl: null,
        },
      ],
    })
    expect(result.colors[0]!.primaryColorOriginal).toBe('azul')
    expect(result.colors[0]!.primaryWasCorrected).toBe(true)
    expect(result.colors[0]!.secondaryColorOriginal).toBe('blanco')
    expect(result.colors[0]!.secondaryWasCorrected).toBe(false)
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
          primaryColorOriginal: 'rojo',
          primaryWasCorrected: false,
          secondaryColorOriginal: 'blanco',
          secondaryWasCorrected: false,
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
        primaryColorOriginal: 'rojo',
        primaryWasCorrected: false,
        secondaryColorOriginal: 'blanco',
        secondaryWasCorrected: false,
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
          digitsOriginal: '20',
          wasCorrected: false,
          correctedAt: null,
        },
      ],
    })
    expect(result.bibs[0]!.cropUrl).toBeNull()
  })
})
