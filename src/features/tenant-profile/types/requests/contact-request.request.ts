export const CONTACT_REQUEST_REASONS = ['more_quota', 'renewal'] as const

export type ContactRequestReason = (typeof CONTACT_REQUEST_REASONS)[number]

export interface IContactRequestRequest {
  reason: ContactRequestReason
  eventsWanted?: number
  message: string
}
