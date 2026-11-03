export type BillingIdType = 'ruc' | 'national_id' | 'passport'

export interface IApiBillingAccount {
  id: string
  idType: BillingIdType
  idNumber: string
  legalName: string
  email: string
  address: string | null
  isDefault: boolean
}

export interface IApiMyBillingAccounts {
  accounts: IApiBillingAccount[]
  invoiceConsentGiven: boolean
}

export interface IBillingAccount {
  id: string
  idType: BillingIdType
  idNumber: string
  legalName: string
  email: string
  address: string | null
  isDefault: boolean
}

export interface IMyBillingAccounts {
  accounts: IBillingAccount[]
  invoiceConsentGiven: boolean
}
