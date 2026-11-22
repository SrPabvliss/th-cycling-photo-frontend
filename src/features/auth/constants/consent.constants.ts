export const CONSENT_TYPE = {
  TERMS_PRIVACY: 'terms_privacy',
  GUARDIAN: 'guardian',
  ELECTRONIC_INVOICE: 'electronic_invoice',
  /** Optional: birthday and holiday greetings. Never required, never asked again on re-accept. */
  COMMUNITY_EMAILS: 'community_emails',
} as const

export type ConsentType = (typeof CONSENT_TYPE)[keyof typeof CONSENT_TYPE]
