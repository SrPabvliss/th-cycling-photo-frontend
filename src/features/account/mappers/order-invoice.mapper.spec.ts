import { describe, expect, it } from 'vitest'

import { toMyOrderInvoice, toOrderInvoice } from './order-invoice.mapper'

describe('order-invoice.mapper', () => {
  it('maps the admin invoice with its documents, messages and deliveries', () => {
    const invoice = toOrderInvoice({
      state: 'rejected',
      rejection: { source: 'sri', messages: ['35: ARCHIVO NO CUMPLE ESTRUCTURA'] },
      canCorrect: true,
      canRetryAnnulment: false,
      documents: [
        {
          id: 'doc-1',
          type: 'invoice',
          state: 'returned',
          number: '001-001-000000123',
          accessKey: '1234567890',
          issueDate: '2026-11-03',
          authorizedAt: null,
          sriMessages: [{ identifier: '35', message: 'X', additionalInfo: null, type: 'ERROR' }],
          deliveries: [],
          downloadable: false,
          resendable: false,
          current: true,
        },
      ],
    })
    expect(invoice.rejection?.messages).toEqual(['35: ARCHIVO NO CUMPLE ESTRUCTURA'])
    expect(invoice.canCorrect).toBe(true)
    expect(invoice.documents[0]!.accessKey).toBe('1234567890')
    expect(invoice.documents[0]!.sriMessages).toHaveLength(1)
    expect(invoice.documents[0]!.current).toBe(true)
  })

  it('maps the buyer invoice without admin-only fields', () => {
    const invoice = toMyOrderInvoice({
      state: 'authorized',
      rejectionMessages: [],
      canCorrect: false,
      documents: [
        {
          id: 'doc-1',
          type: 'invoice',
          state: 'authorized',
          number: '001-001-000000123',
          issueDate: '2026-11-03',
          downloadable: true,
          current: false,
        },
      ],
    })
    expect(invoice.documents[0]).toEqual({
      id: 'doc-1',
      type: 'invoice',
      state: 'authorized',
      number: '001-001-000000123',
      issueDate: '2026-11-03',
      downloadable: true,
      current: false,
    })
  })
})
