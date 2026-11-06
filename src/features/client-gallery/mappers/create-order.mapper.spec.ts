import { describe, expect, it } from 'vitest'

import { toCreateOrderRequest } from './create-order.mapper'

describe('toCreateOrderRequest', () => {
  it('sends the category, billing account and payment method with the photos', () => {
    const request = toCreateOrderRequest(
      { notes: '  ', bibNumber: ' 127 ', snapCategoryName: 'Elite' },
      new Set(['p-1', 'p-2']),
      { billingAccountId: 'ba-1', method: 'card' },
    )

    expect(request).toEqual({
      photoIds: ['p-1', 'p-2'],
      notes: null,
      bibNumber: '127',
      snapCategoryName: 'Elite',
      billingAccountId: 'ba-1',
      method: 'card',
    })
  })
})
