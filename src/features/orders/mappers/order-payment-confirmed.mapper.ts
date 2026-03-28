import type {
  IApiOrderPaymentConfirmed,
  IOrderPaymentConfirmed,
} from '../types/responses/order-payment-confirmed.response'

export function toOrderPaymentConfirmed(api: IApiOrderPaymentConfirmed): IOrderPaymentConfirmed {
  return {
    orderId: api.orderId,
    deliveryUrl: api.deliveryUrl,
    whatsappTemplate: api.whatsappTemplate,
  }
}
