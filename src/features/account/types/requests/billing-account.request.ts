import type { BillingIdType } from '../responses/billing-account.response'

export interface ICreateBillingAccountRequest {
  idType: BillingIdType
  idNumber: string
  legalName: string
  email: string
  address?: string
}
