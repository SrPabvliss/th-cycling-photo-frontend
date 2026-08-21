import type { LocationQuery } from 'vue-router'

import type { IConfirmPaymentRequest } from '@/features/payments/types/requests/payment.request'
import type { IPaymentGateway } from '../types'
import PayphoneBox from './PayphoneBox.vue'

export const PAYPHONE_PROVIDER = 'payphone'

function parsePayphoneReturn(query: LocationQuery): IConfirmPaymentRequest | null {
  const clientTransactionId = String(query.clientTransactionId ?? '')
  const id = Number(query.id ?? 0)

  if (!clientTransactionId || !id) return null

  return { clientTransactionId, id }
}

export const payphoneGateway: IPaymentGateway = {
  provider: PAYPHONE_PROVIDER,
  checkoutComponent: PayphoneBox,
  parseReturn: parsePayphoneReturn,
}
