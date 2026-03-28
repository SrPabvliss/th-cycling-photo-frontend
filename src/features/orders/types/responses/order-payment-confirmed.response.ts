/** API projection from PATCH /orders/:id/confirm-payment and regenerate-delivery */
export interface IApiOrderPaymentConfirmed {
  orderId: string
  deliveryUrl: string
  whatsappTemplate: string
}

/** Frontend domain type (identical — no transformation needed) */
export interface IOrderPaymentConfirmed {
  orderId: string
  deliveryUrl: string
  whatsappTemplate: string
}
