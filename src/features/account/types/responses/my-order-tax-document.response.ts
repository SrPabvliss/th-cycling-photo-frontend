export interface IApiMyOrderTaxDocument {
  id: string
  type: 'invoice' | 'credit_note'
  state: string
  number: string
  issueDate: string
  downloadable: boolean
  current: boolean
}

export type IMyOrderTaxDocument = IApiMyOrderTaxDocument
