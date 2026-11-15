import { describe, expect, it } from 'vitest'

import { toCreateOrderRequest } from './create-order.mapper'

describe('toCreateOrderRequest', () => {
  it('sends only the photos, the billing account and the payment method', () => {
    const request = toCreateOrderRequest({
      photoIds: ['a', 'b'],
      billingAccountId: 'b1',
      method: 'transfer',
    })

    expect(request).toEqual({ photoIds: ['a', 'b'], billingAccountId: 'b1', method: 'transfer' })
    expect(request).not.toHaveProperty('notes')
    expect(request).not.toHaveProperty('bibNumber')
    expect(request).not.toHaveProperty('snapCategoryName')
  })
})
