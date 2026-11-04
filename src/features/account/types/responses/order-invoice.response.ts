import type { IApiOrderTaxDocument, IOrderTaxDocument } from './order-tax-document.response'

export type InvoiceStateValue = 'requested' | 'in_process' | 'authorized' | 'rejected' | 'annulled'

export interface IApiOrderInvoiceRejection {
  source: 'sri' | 'intake' | 'credit_note'
  messages: string[]
}

export interface IApiOrderInvoice {
  state: InvoiceStateValue
  rejection: IApiOrderInvoiceRejection | null
  canCorrect: boolean
  canRetryAnnulment: boolean
  documents: IApiOrderTaxDocument[]
}

export type IOrderInvoiceRejection = IApiOrderInvoiceRejection

export interface IOrderInvoice {
  state: InvoiceStateValue
  rejection: IOrderInvoiceRejection | null
  canCorrect: boolean
  canRetryAnnulment: boolean
  documents: IOrderTaxDocument[]
}
