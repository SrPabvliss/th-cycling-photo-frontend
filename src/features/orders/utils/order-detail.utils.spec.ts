import { describe, expect, it } from 'vitest'

import type { IOrderDetail } from '../types/responses/order-detail.response'
import { getOrderIdentityDiffs, hasOrderPhoneDrifted } from './order-detail.utils'

const order = (overrides: Partial<IOrderDetail>) =>
  ({
    userName: 'Ana Rider',
    snapFirstName: 'Ana',
    snapLastName: 'Rider',
    snapWhatsapp: '+593991234567',
    customerPrimaryPhone: '+593991234567',
    ...overrides,
  }) as IOrderDetail

describe('hasOrderPhoneDrifted', () => {
  it('is false while the order and the account hold the same number', () => {
    expect(hasOrderPhoneDrifted(order({}))).toBe(false)
  })

  it('is true when the account moved on to another number', () => {
    expect(hasOrderPhoneDrifted(order({ customerPrimaryPhone: '+593999888777' }))).toBe(true)
  })

  it('is true when the order has no number and the account does', () => {
    expect(hasOrderPhoneDrifted(order({ snapWhatsapp: null }))).toBe(true)
  })

  it('is false when the account has no number to offer', () => {
    expect(hasOrderPhoneDrifted(order({ customerPrimaryPhone: null }))).toBe(false)
  })
})

describe('getOrderIdentityDiffs', () => {
  it('finds nothing when the order still matches the account', () => {
    expect(getOrderIdentityDiffs(order({}))).toEqual([])
  })

  it('shows the phone of the order next to the one of the account', () => {
    const diffs = getOrderIdentityDiffs(order({ customerPrimaryPhone: '+593999888777' }))

    expect(diffs).toEqual([
      { label: 'Teléfono', before: '+593 99 123 4567', after: '+593 99 988 8777' },
    ])
  })

  it('shows a changed name and a changed phone together', () => {
    const diffs = getOrderIdentityDiffs(order({ userName: 'Ana María Rider', snapWhatsapp: null }))

    expect(diffs.map((diff) => diff.label)).toEqual(['Nombre', 'Teléfono'])
    expect(diffs[1]!.before).toBe('sin número')
  })
})
