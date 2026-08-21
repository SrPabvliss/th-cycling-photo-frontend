import type { Component } from 'vue'
import type { LocationQuery } from 'vue-router'

import type { IConfirmPaymentRequest } from '@/features/payments/types/requests/payment.request'
import type { IPaymentIntent } from '@/features/payments/types/responses/payment-intent.response'

export interface IPaymentGatewayCheckoutProps {
  intent: IPaymentIntent
}

export interface IPaymentGatewayCheckoutEmits {
  (event: 'setup-failed', error: unknown): void
}

export interface IPaymentGateway {
  provider: string
  checkoutComponent: Component
  parseReturn: (query: LocationQuery) => IConfirmPaymentRequest | null
}
