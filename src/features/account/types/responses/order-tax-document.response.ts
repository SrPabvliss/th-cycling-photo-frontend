export interface IApiOrderSriMessage {
  identifier: string
  message: string
  additionalInfo: string | null
  type: string
}

export interface IApiOrderDeliveryRequester {
  kind: string
  id: string
  name: string
}

export interface IApiOrderDeliveryRecipient {
  email: string
  outcome: string
}

export interface IApiOrderDelivery {
  kind: string
  requestedBy: IApiOrderDeliveryRequester | null
  recipients: IApiOrderDeliveryRecipient[]
  sentAt: string
}

export interface IApiOrderTaxDocument {
  id: string
  type: 'invoice' | 'credit_note'
  state: string
  number: string
  accessKey: string
  issueDate: string
  authorizedAt: string | null
  sriMessages: IApiOrderSriMessage[]
  deliveries: IApiOrderDelivery[]
  downloadable: boolean
  resendable: boolean
  current: boolean
}

export type IOrderSriMessage = IApiOrderSriMessage
export type IOrderDeliveryRequester = IApiOrderDeliveryRequester
export type IOrderDeliveryRecipient = IApiOrderDeliveryRecipient
export type IOrderDelivery = IApiOrderDelivery
export type IOrderTaxDocument = IApiOrderTaxDocument
