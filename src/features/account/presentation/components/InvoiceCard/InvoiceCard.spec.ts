import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import InvoiceCard from './InvoiceCard.vue'
import type { IOrderInvoice } from '../../../types/responses/order-invoice.response'
import type { IMyOrderInvoice } from '../../../types/responses/my-order-invoice.response'

const adminInvoice = (overrides: Partial<IOrderInvoice> = {}): IOrderInvoice => ({
  state: 'authorized',
  rejection: null,
  canCorrect: false,
  canRetryAnnulment: false,
  documents: [
    {
      id: 'doc-1',
      type: 'invoice',
      state: 'authorized',
      number: '001-001-000000123',
      accessKey: '0311202601179000000000110010010000001231234567811',
      issueDate: '2026-11-03',
      authorizedAt: '2026-11-03T15:00:00.000Z',
      sriMessages: [],
      deliveries: [
        {
          kind: 'resend',
          requestedBy: { kind: 'operator', id: 'u1', name: 'Ana Admin' },
          recipients: [{ email: 'buyer@mail.com', outcome: 'accepted' }],
          sentAt: '2026-11-03T15:05:00.000Z',
        },
      ],
      downloadable: true,
      resendable: true,
      current: true,
    },
  ],
  ...overrides,
})

const buyerInvoice = (overrides: Partial<IMyOrderInvoice> = {}): IMyOrderInvoice => ({
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
      current: true,
    },
  ],
  ...overrides,
})

describe('InvoiceCard', () => {
  it('offers PDF and XML downloads for an authorized invoice', async () => {
    const w = mount(InvoiceCard, {
      props: { invoice: buyerInvoice(), audience: 'buyer', busyKey: null },
    })
    expect(w.text()).toContain('Factura autorizada')
    expect(w.text()).toContain('001-001-000000123')
    await w.get('[data-test="download-pdf-doc-1"]').trigger('click')
    await w.get('[data-test="download-xml-doc-1"]').trigger('click')
    expect(w.emitted('download')).toEqual([
      ['doc-1', 'pdf'],
      ['doc-1', 'xml'],
    ])
  })

  it('says the invoice was annulled before reaching the SRI when it was cancelled', () => {
    const w = mount(InvoiceCard, {
      props: {
        invoice: buyerInvoice({
          state: 'annulled',
          documents: [
            {
              id: 'doc-1',
              type: 'invoice',
              state: 'cancelled',
              number: '001-001-000000123',
              issueDate: '2026-11-03',
              downloadable: false,
              current: true,
            },
          ],
        }),
        audience: 'buyer',
        busyKey: null,
      },
    })
    expect(w.text()).toContain('Factura anulada antes de llegar al SRI')
    expect(w.find('[data-test="download-pdf-doc-1"]').exists()).toBe(false)
  })

  it('shows the credit note with its own downloads', async () => {
    const w = mount(InvoiceCard, {
      props: {
        invoice: buyerInvoice({
          state: 'annulled',
          documents: [
            {
              id: 'doc-1',
              type: 'invoice',
              state: 'annulled',
              number: '001-001-000000123',
              issueDate: '2026-11-03',
              downloadable: true,
              current: true,
            },
            {
              id: 'doc-2',
              type: 'credit_note',
              state: 'authorized',
              number: '001-001-000000007',
              issueDate: '2026-11-04',
              downloadable: true,
              current: true,
            },
          ],
        }),
        audience: 'buyer',
        busyKey: null,
      },
    })
    expect(w.text()).toContain('Factura anulada')
    expect(w.text()).toContain('Nota de crédito autorizada')
    expect(w.text()).toContain('001-001-000000007')
    await w.get('[data-test="download-xml-doc-2"]').trigger('click')
    expect(w.emitted('download')).toEqual([['doc-2', 'xml']])
  })

  it('offers correction only when canCorrect', async () => {
    const rejected = buyerInvoice({
      state: 'rejected',
      rejectionMessages: ['RUC inválido'],
      documents: [],
    })
    const without = mount(InvoiceCard, {
      props: { invoice: rejected, audience: 'buyer', busyKey: null },
    })
    expect(without.find('[data-test="correct"]').exists()).toBe(false)

    const withCorrect = mount(InvoiceCard, {
      props: { invoice: { ...rejected, canCorrect: true }, audience: 'buyer', busyKey: null },
    })
    expect(withCorrect.text()).toContain('Factura rechazada')
    expect(withCorrect.text()).toContain('RUC inválido')
    await withCorrect.get('[data-test="correct"]').trigger('click')
    expect(withCorrect.emitted('correct')).toHaveLength(1)
  })

  it('hides resend and delivery history from the buyer', () => {
    const buyer = mount(InvoiceCard, {
      props: { invoice: buyerInvoice(), audience: 'buyer', busyKey: null },
    })
    expect(buyer.find('[data-test="resend-doc-1"]').exists()).toBe(false)
    expect(buyer.find('[data-test="deliveries-doc-1"]').exists()).toBe(false)
  })

  it('gives the admin the access key, the delivery history and the resend action', async () => {
    const admin = mount(InvoiceCard, {
      props: { invoice: adminInvoice(), audience: 'admin', busyKey: null },
    })
    expect(admin.text()).toContain('0311202601179000000000110010010000001231234567811')
    expect(admin.get('[data-test="deliveries-doc-1"]').text()).toContain('buyer@mail.com')
    expect(admin.get('[data-test="deliveries-doc-1"]').text()).toContain('Ana Admin')
    const history = admin.get('[data-test="deliveries-doc-1"]').text()
    expect(history).toContain('Reenvío')
    expect(history).toContain('Admin')
    expect(history).toContain('Enviado')
    await admin.get('[data-test="resend-doc-1"]').trigger('click')
    expect(admin.emitted('resend')).toEqual([['doc-1']])
  })

  it('offers the annulment retry to the admin only when canRetryAnnulment', async () => {
    const admin = mount(InvoiceCard, {
      props: {
        invoice: adminInvoice({ state: 'rejected', canRetryAnnulment: true }),
        audience: 'admin',
        busyKey: null,
      },
    })
    await admin.get('[data-test="retry-annulment"]').trigger('click')
    expect(admin.emitted('retryAnnulment')).toHaveLength(1)
  })

  it('falls back to the raw value for unknown delivery vocabulary', () => {
    const invoice = adminInvoice()
    invoice.documents[0]!.deliveries[0]!.recipients[0]!.outcome = 'bounced'
    const admin = mount(InvoiceCard, { props: { invoice, audience: 'admin', busyKey: null } })
    expect(admin.get('[data-test="deliveries-doc-1"]').text()).toContain('bounced')
  })

  it('words the credit note state', () => {
    const doc = (state: string) => ({
      id: 'doc-2',
      type: 'credit_note' as const,
      state,
      number: '001-001-000000007',
      issueDate: '2026-11-04',
      downloadable: false,
      current: true,
    })
    const text = (state: string) =>
      mount(InvoiceCard, {
        props: {
          invoice: buyerInvoice({ state: 'in_process', documents: [doc(state)] }),
          audience: 'buyer',
          busyKey: null,
        },
      }).text()
    expect(text('submitted')).toContain('Nota de crédito en proceso')
    expect(text('authorized')).toContain('Nota de crédito autorizada')
  })

  it('never tells the buyer a credit note was rejected, while the admin sees it', () => {
    const creditNote = {
      id: 'doc-2',
      type: 'credit_note' as const,
      state: 'not_authorized',
      number: '001-001-000000007',
      issueDate: '2026-11-04',
      downloadable: false,
      current: true,
    }
    const buyer = mount(InvoiceCard, {
      props: {
        invoice: buyerInvoice({ state: 'in_process', documents: [creditNote] }),
        audience: 'buyer',
        busyKey: null,
      },
    }).text()
    expect(buyer).not.toContain('Nota de crédito rechazada')
    expect(buyer).toContain('Nota de crédito en proceso')

    const admin = mount(InvoiceCard, {
      props: {
        invoice: adminInvoice({
          state: 'rejected',
          documents: [
            {
              ...creditNote,
              accessKey: '1'.repeat(49),
              authorizedAt: null,
              sriMessages: [],
              deliveries: [],
              resendable: false,
            },
          ],
        }),
        audience: 'admin',
        busyKey: null,
      },
    }).text()
    expect(admin).toContain('Nota de crédito rechazada')
  })

  it('titles each invoice row by its state', () => {
    const invoiceRow = (id: string, state: string, current: boolean) => ({
      id,
      type: 'invoice' as const,
      state,
      number: `001-001-00000000${id.slice(-1)}`,
      issueDate: '2026-11-03',
      downloadable: state === 'authorized' || state === 'annulled',
      current,
    })
    const w = mount(InvoiceCard, {
      props: {
        invoice: buyerInvoice({
          state: 'authorized',
          documents: [
            invoiceRow('doc-1', 'cancelled', false),
            invoiceRow('doc-2', 'annulled', false),
            invoiceRow('doc-3', 'authorized', true),
          ],
        }),
        audience: 'buyer',
        busyKey: null,
      },
    })
    const titles = w.findAll('.invoice-card__document-head strong').map((node) => node.text())
    expect(titles).toEqual(['Factura anulada', 'Factura anulada', 'Factura'])
    expect(w.get('.invoice-card__title').text()).toBe('Factura autorizada')
  })

  it('says annulled before the SRI only when the current sale was cancelled', () => {
    const w = mount(InvoiceCard, {
      props: {
        invoice: buyerInvoice({
          state: 'annulled',
          documents: [
            {
              id: 'doc-1',
              type: 'invoice',
              state: 'cancelled',
              number: '001-001-000000001',
              issueDate: '2026-11-01',
              downloadable: false,
              current: false,
            },
            {
              id: 'doc-2',
              type: 'invoice',
              state: 'annulled',
              number: '001-001-000000002',
              issueDate: '2026-11-03',
              downloadable: true,
              current: true,
            },
            {
              id: 'doc-3',
              type: 'credit_note',
              state: 'authorized',
              number: '001-001-000000007',
              issueDate: '2026-11-04',
              downloadable: true,
              current: true,
            },
          ],
        }),
        audience: 'buyer',
        busyKey: null,
      },
    })
    expect(w.get('.invoice-card__title').text()).toBe('Factura anulada')
    expect(w.text()).not.toContain('antes de llegar al SRI')
    expect(w.findAll('.invoice-card__document')).toHaveLength(3)
  })

  it('words the resend action by document type', () => {
    const admin = mount(InvoiceCard, {
      props: {
        invoice: adminInvoice({
          state: 'annulled',
          documents: [
            { ...adminInvoice().documents[0]!, state: 'annulled' },
            {
              ...adminInvoice().documents[0]!,
              id: 'doc-2',
              type: 'credit_note',
              number: '001-001-000000007',
              deliveries: [],
            },
          ],
        }),
        audience: 'admin',
        busyKey: null,
      },
    })
    expect(admin.get('[data-test="resend-doc-1"]').text()).toBe('Reenviar factura')
    expect(admin.get('[data-test="resend-doc-2"]').text()).toBe('Reenviar nota de crédito')
  })
})
