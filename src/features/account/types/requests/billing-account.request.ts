import type { BillingIdType } from '../responses/billing-account.response'

export interface ICreateBillingAccountRequest {
  idType: BillingIdType
  idNumber: string
  legalName: string
  email: string
  address?: string
}

/** PATCH: only what changed. `idType` and `idNumber` travel together; `address: null` clears it. */
export interface IUpdateBillingAccountRequest {
  idType?: BillingIdType
  idNumber?: string
  legalName?: string
  email?: string
  address?: string | null
}
