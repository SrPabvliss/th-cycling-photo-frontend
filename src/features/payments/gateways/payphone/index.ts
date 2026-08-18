import type { LocationQuery } from 'vue-router'

import { PAYMENT_MODE } from '@/features/payments/types/payment-account'
import type { IConfirmPaymentRequest } from '@/features/payments/types/requests/payment.request'
import type { IPaymentGateway } from '../types'
import PayphoneBox from './PayphoneBox.vue'
import PayphoneCredentialsFields from './PayphoneCredentialsFields.vue'

export const PAYPHONE_PROVIDER = 'payphone'

function parsePayphoneReturn(query: LocationQuery): IConfirmPaymentRequest | null {
  const clientTransactionId = String(query.clientTransactionId ?? '')
  const id = Number(query.id ?? 0)

  if (!clientTransactionId || !id) return null

  return { clientTransactionId, id }
}

export const payphoneGateway: IPaymentGateway = {
  provider: PAYPHONE_PROVIDER,
  modes: [
    { value: PAYMENT_MODE.OWN_MERCHANT, label: 'Con mi cuenta Payphone Business' },
    { value: PAYMENT_MODE.SPLIT_RECEIVER, label: 'A mi Payphone personal' },
  ],
  checkoutComponent: PayphoneBox,
  credentialsFieldsComponent: PayphoneCredentialsFields,
  parseReturn: parsePayphoneReturn,
}
