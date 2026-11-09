import type { AccountType } from '@/shared/constants/payout'

export type PayoutMethodProvider = 'payphone' | 'bank_transfer'
export type PayoutMethodStatus = 'pending' | 'verified' | 'disabled'
export type PayoutMethodAccountType = AccountType

export interface PayoutMethodResponse {
  id: string
  provider: PayoutMethodProvider
  isActive: boolean
  sortOrder: number
  status: PayoutMethodStatus
  receiverIdentifier: string | null
  bankName: string | null
  accountNumber: string | null
  accountType: PayoutMethodAccountType | null
  accountHolder: string | null
  holderIdentification: string | null
  verifiedAt: string | null
}
