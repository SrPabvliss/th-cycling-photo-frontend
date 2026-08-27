import type {
  PayoutMethodAccountType,
  PayoutMethodProvider,
} from '../responses/payout-method.response'

export interface CreatePayoutMethodRequest {
  provider: PayoutMethodProvider
  phone?: string
  bankName?: string
  accountNumber?: string
  accountType?: PayoutMethodAccountType
  accountHolder?: string
  holderIdentification?: string
  password?: string
}

export interface UpdatePayoutMethodRequest {
  phone?: string
  bankName?: string
  accountNumber?: string
  accountType?: PayoutMethodAccountType
  accountHolder?: string
  holderIdentification?: string
  isActive?: boolean
  sortOrder?: number
  password?: string
}

export interface IDeletePayoutMethodRequest {
  id: string
  password?: string
}
