import type { InvoiceStateValue } from './order-invoice.response'
import type { IApiMyOrderTaxDocument, IMyOrderTaxDocument } from './my-order-tax-document.response'

export interface IApiMyOrderInvoice {
  state: InvoiceStateValue
  rejectionMessages: string[]
  canCorrect: boolean
  documents: IApiMyOrderTaxDocument[]
}

export interface IMyOrderInvoice {
  state: InvoiceStateValue
  rejectionMessages: string[]
  canCorrect: boolean
  documents: IMyOrderTaxDocument[]
}
