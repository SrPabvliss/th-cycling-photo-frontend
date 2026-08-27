import { describe, expect, it } from 'vitest'
import type { IApiPhotoDetail } from '@/shared/types/photo-detail.types'
import { photoDetailToListItem, toPhotoDetail } from '@/shared/mappers/photo-detail.mapper'

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
        correctedByName: null,
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

  it('maps correctedByName on bibs', () => {
    const result = toPhotoDetail({
      ...baseApi,
      bibs: [
        {
          id: 'b1',
          digits: '20',
          status: 'read',
          confidence: 0.95,
          source: 'reviewer',
          cropUrl: null,
          digitsOriginal: '02',
          wasCorrected: true,
          correctedAt: '2026-05-09T10:00:00Z',
          correctedByName: 'Ana Torres',
        },
      ],
    })
    expect(result.bibs[0]!.correctedByName).toBe('Ana Torres')
  })

  it('maps the photo-level enrichment fields through', () => {
    const result = toPhotoDetail({
      ...baseApi,
      photoCategoryId: 7,
      photoCategoryName: 'Elite',
      orders: [
        {
          id: 'o1',
          buyerName: 'Carla Ruiz',
          createdAt: '2026-05-02T00:00:00Z',
          status: 'paid',
        },
      ],
      position: 3,
      eventPhotoCount: 12,
      previousSlug: 'prev-slug',
      nextSlug: 'next-slug',
    })
    expect(result.photoCategoryId).toBe(7)
    expect(result.photoCategoryName).toBe('Elite')
    expect(result.orders).toHaveLength(1)
    expect(result.orders[0]!.id).toBe('o1')
    expect(result.orders[0]!.buyerName).toBe('Carla Ruiz')
    expect(result.orders[0]!.status).toBe('paid')
    expect(result.position).toBe(3)
    expect(result.eventPhotoCount).toBe(12)
    expect(result.previousSlug).toBe('prev-slug')
    expect(result.nextSlug).toBe('next-slug')
  })

  it("converts an order's createdAt to a Date", () => {
    const result = toPhotoDetail({
      ...baseApi,
      orders: [
        {
          id: 'o1',
          buyerName: 'Carla Ruiz',
          createdAt: '2026-05-02T00:00:00Z',
          status: 'paid',
        },
      ],
    })
    expect(result.orders[0]!.createdAt).toBeInstanceOf(Date)
  })

  it('defaults the enrichment fields when the API payload predates them', () => {
    const result = toPhotoDetail({
      ...baseApi,
      bibs: [
        {
          id: 'b1',
          digits: '20',
          status: 'read',
          confidence: 0.95,
          source: 'ai',
          cropUrl: null,
          digitsOriginal: '20',
          wasCorrected: false,
          correctedAt: null,
        },
      ],
    })
    expect(result.photoCategoryId).toBeNull()
    expect(result.photoCategoryName).toBeNull()
    expect(result.orders).toEqual([])
    expect(result.position).toBe(1)
    expect(result.eventPhotoCount).toBe(1)
    expect(result.previousSlug).toBeNull()
    expect(result.nextSlug).toBeNull()
    expect(result.bibs[0]!.correctedByName).toBeNull()
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

describe('photoDetailToListItem', () => {
  it('maps IPhotoDetail to IPhotoListItem properly', () => {
    const detail = toPhotoDetail({
      ...baseApi,
      photoCategoryId: 5,
      photoCategoryName: 'VIP',
      orders: [
        {
          id: 'o1',
          buyerName: 'Buyer',
          createdAt: '2026-05-02T00:00:00Z',
          status: 'paid',
        },
      ],
      bibs: [
        {
          id: 'b1',
          digits: '123',
          status: 'read',
          confidence: 0.99,
          source: 'ai',
          cropUrl: null,
          digitsOriginal: '123',
          wasCorrected: true,
          correctedAt: null,
        },
      ],
    })

    const listItem = photoDetailToListItem(detail)
    expect(listItem.id).toBe('p1')
    expect(listItem.publicSlug).toBe('pub')
    expect(listItem.filename).toBe('IMG.jpg')
    expect(listItem.thumbnailUrl).toBe('https://t/IMG.jpg')
    expect(listItem.photoCategoryId).toBe(5)
    expect(listItem.photoCategoryName).toBe('VIP')
    expect(listItem.sold).toBe(true)
    expect(listItem.bibs).toEqual([
      {
        digits: '123',
        source: 'ai',
        confidence: 0.99,
        status: 'read',
        corrected: true,
      },
    ])
  })
})
