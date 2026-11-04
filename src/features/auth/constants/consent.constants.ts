export const CONSENT_TYPE = {
  TERMS_PRIVACY: 'terms_privacy',
  GUARDIAN: 'guardian',
  ELECTRONIC_INVOICE: 'electronic_invoice',
} as const

export type ConsentType = (typeof CONSENT_TYPE)[keyof typeof CONSENT_TYPE]
