import type { BillingIdType } from '../types/responses/billing-account.response'

const ID_NUMBER_PATTERNS: Record<BillingIdType, RegExp> = {
  national_id: /^\d{10}$/,
  ruc: /^\d{13}$/,
  passport: /^[A-Z0-9]{1,20}$/,
}

export function normalizeIdNumber(idType: BillingIdType, raw: string): string {
  return idType === 'passport' ? raw.replace(/[\s-]/g, '').toUpperCase() : raw.trim()
}

export function isWellFormedIdNumber(idType: BillingIdType, value: string): boolean {
  return ID_NUMBER_PATTERNS[idType].test(value)
}
