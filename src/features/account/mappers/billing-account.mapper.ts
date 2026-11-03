import type {
  IApiBillingAccount,
  IApiMyBillingAccounts,
  IBillingAccount,
  IMyBillingAccounts,
} from '../types/responses/billing-account.response'

export function toBillingAccount(api: IApiBillingAccount): IBillingAccount {
  return {
    id: api.id,
    idType: api.idType,
    idNumber: api.idNumber,
    legalName: api.legalName,
    email: api.email,
    address: api.address,
    isDefault: api.isDefault,
  }
}

export function toMyBillingAccounts(api: IApiMyBillingAccounts): IMyBillingAccounts {
  return {
    accounts: api.accounts.map(toBillingAccount),
    invoiceConsentGiven: api.invoiceConsentGiven,
  }
}
