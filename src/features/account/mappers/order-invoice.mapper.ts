import type {
  IApiMyOrderInvoice,
  IMyOrderInvoice,
} from '../types/responses/my-order-invoice.response'
import type { IApiOrderInvoice, IOrderInvoice } from '../types/responses/order-invoice.response'

export function toOrderInvoice(api: IApiOrderInvoice): IOrderInvoice {
  return {
    state: api.state,
    rejection: api.rejection
      ? { source: api.rejection.source, messages: api.rejection.messages }
      : null,
    canCorrect: api.canCorrect,
    canRetryAnnulment: api.canRetryAnnulment,
    documents: api.documents.map((document) => ({
      id: document.id,
      type: document.type,
      state: document.state,
      number: document.number,
      accessKey: document.accessKey,
      issueDate: document.issueDate,
      authorizedAt: document.authorizedAt,
      sriMessages: document.sriMessages,
      deliveries: document.deliveries,
      downloadable: document.downloadable,
      resendable: document.resendable,
      current: document.current,
    })),
  }
}

export function toMyOrderInvoice(api: IApiMyOrderInvoice): IMyOrderInvoice {
  return {
    state: api.state,
    rejectionMessages: api.rejectionMessages,
    canCorrect: api.canCorrect,
    documents: api.documents.map((document) => ({
      id: document.id,
      type: document.type,
      state: document.state,
      number: document.number,
      issueDate: document.issueDate,
      downloadable: document.downloadable,
      current: document.current,
    })),
  }
}
