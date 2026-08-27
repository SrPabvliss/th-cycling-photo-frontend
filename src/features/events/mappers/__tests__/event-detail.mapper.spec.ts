import { describe, expect, it } from 'vitest'

import { toEventDetail } from '@/shared/mappers/event-detail.mapper'
import type { IApiEventDetail } from '../../types/responses/event-detail.response'

function makeApiDetail(overrides: Partial<IApiEventDetail> = {}): IApiEventDetail {
  return {
    id: 'e1',
    slug: 'vuelta-al-cotopaxi-2026',
    name: 'Vuelta al Cotopaxi 2026',
    startDate: '2026-05-01',
    endDate: '2026-05-02',
    provinceName: 'Cotopaxi',
    cantonName: 'Latacunga',
    provinceId: 5,
    cantonId: 50,
    coverImageUrl: null,
    coverImageSlug: null,
    status: 'active',
    photoCount: 2428,
    classifiedCount: 900,
    categorizedCount: 640,
    totalFileSize: 1024,
    photoQuota: 3000,
    photosUploaded: 2428,
    isFrozen: false,
    frozenAt: null,
    organizerName: 'Andes Photo',
    eventTypeName: 'Ruta',
    contractName: 'Contrato 2026-A',
    reviewedCount: 1200,
    lastUploadAt: '2026-08-01T12:00:00.000Z',
    revenue: '196.00',
    ordersCount: 36,
    soldPhotoCount: 72,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-02T00:00:00.000Z',
    ...overrides,
  }
}

describe('toEventDetail', () => {
  it('carries the event figures through untouched', () => {
    const result = toEventDetail(makeApiDetail())

    expect(result.revenue).toBe('196.00')
    expect(result.ordersCount).toBe(36)
    expect(result.soldPhotoCount).toBe(72)
    expect(result.reviewedCount).toBe(1200)
    expect(result.categorizedCount).toBe(640)
  })

  it('keeps revenue as a string so no float rounding happens in the mapper', () => {
    const result = toEventDetail(makeApiDetail({ revenue: '0.10' }))

    expect(result.revenue).toBe('0.10')
  })

  it('parses the two timestamps and leaves them null when absent', () => {
    const withDates = toEventDetail(
      makeApiDetail({
        frozenAt: '2026-06-01T10:00:00.000Z',
        lastUploadAt: '2026-08-01T12:00:00.000Z',
      }),
    )
    expect(withDates.frozenAt).toEqual(new Date('2026-06-01T10:00:00.000Z'))
    expect(withDates.lastUploadAt).toEqual(new Date('2026-08-01T12:00:00.000Z'))

    const without = toEventDetail(makeApiDetail({ frozenAt: null, lastUploadAt: null }))
    expect(without.frozenAt).toBeNull()
    expect(without.lastUploadAt).toBeNull()
  })

  it('accepts an event that consumed no contract', () => {
    const result = toEventDetail(makeApiDetail({ contractName: null }))

    expect(result.contractName).toBeNull()
  })
})
