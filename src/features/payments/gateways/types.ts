import type { Component } from 'vue'
import type { LocationQuery } from 'vue-router'

import type {
  IPaymentAccount,
  IPaymentCredentials,
  PaymentMode,
} from '@/features/payments/types/payment-account'
import type { IConfirmPaymentRequest } from '@/features/payments/types/requests/payment.request'
import type { IPaymentIntent } from '@/features/payments/types/responses/payment-intent.response'

export interface IPaymentGatewayCheckoutProps {
  intent: IPaymentIntent
  settling: boolean
}

export interface IPaymentGatewayCheckoutEmits {
  (event: 'pay-requested'): void
  (event: 'setup-failed', error: unknown): void
}

export interface IPaymentGatewayCheckoutInstance {
  pay: () => Promise<IConfirmPaymentRequest>
  isProcessing: boolean
}

export interface IPaymentGatewayCredentialsProps {
  mode: PaymentMode
  account: IPaymentAccount | null
}

export interface IPaymentGatewayCredentialsEmits {
  (event: 'update:credentials', credentials: IPaymentCredentials): void
}

export interface IPaymentGatewayMode {
  value: PaymentMode
  label: string
}

export interface IPaymentGateway {
  provider: string
  modes: IPaymentGatewayMode[]
  checkoutComponent: Component
  credentialsFieldsComponent: Component
  parseReturn: (query: LocationQuery) => IConfirmPaymentRequest | null
}
