import type { LocationQuery } from 'vue-router'

import type { IConfirmPaymentRequest } from '@/features/payments/types/requests/payment.request'
import type { IPaymentIntent } from '@/features/payments/types/responses/payment-intent.response'
import type { IPaymentGateway, IPaymentGatewayAmount } from '../types'
import PayphoneBox from './PayphoneBox.vue'

export const PAYPHONE_PROVIDER = 'payphone'

function parsePayphoneReturn(query: LocationQuery): IConfirmPaymentRequest | null {
  const clientTransactionId = String(query.clientTransactionId ?? '')
  const id = Number(query.id ?? 0)

  if (!clientTransactionId || !id) return null

  return { clientTransactionId, id }
}

function describePayphoneIntent(intent: IPaymentIntent): IPaymentGatewayAmount | null {
  const { amount, currency } = intent.payload

  if (typeof amount !== 'number' || typeof currency !== 'string') return null

  return { amountCents: amount, currency }
}

export const payphoneGateway: IPaymentGateway = {
  provider: PAYPHONE_PROVIDER,
  checkoutComponent: PayphoneBox,
  parseReturn: parsePayphoneReturn,
  describeIntent: describePayphoneIntent,
}
