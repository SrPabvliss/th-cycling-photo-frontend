import { describe, expect, it } from 'vitest'

import { toMyBillingAccounts } from './billing-account.mapper'

describe('toMyBillingAccounts', () => {
  it('maps every account field and the consent flag', () => {
    const result = toMyBillingAccounts({
      accounts: [
        {
          id: 'ba-1',
          idType: 'ruc',
          idNumber: '1790012345001',
          legalName: 'Ciclismo Andes S.A.',
          email: 'contabilidad@andes.ec',
          address: null,
          isDefault: true,
        },
      ],
      invoiceConsentGiven: false,
    })

    expect(result).toEqual({
      accounts: [
        {
          id: 'ba-1',
          idType: 'ruc',
          idNumber: '1790012345001',
          legalName: 'Ciclismo Andes S.A.',
          email: 'contabilidad@andes.ec',
          address: null,
          isDefault: true,
        },
      ],
      invoiceConsentGiven: false,
    })
  })
})
