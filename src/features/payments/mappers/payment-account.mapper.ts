import type { IPaymentAccount } from '../types/payment-account'
import type { IApiPaymentAccount } from '../types/responses/payment-account.response'

export function toPaymentAccount(api: IApiPaymentAccount): IPaymentAccount {
  return {
    provider: api.provider,
    mode: api.mode,
    status: api.status,
    phone: api.phone,
    storeId: api.storeId,
    verifiedAt: api.verifiedAt ? new Date(api.verifiedAt) : null,
    isUsable: api.isUsable,
  }
}
