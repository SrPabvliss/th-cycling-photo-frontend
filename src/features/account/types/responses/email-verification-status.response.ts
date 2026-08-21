export type IEmailVerificationPurpose = 'verify_current' | 'change_email'

export interface IApiEmailVerificationStatus {
  pending: boolean
  expired: boolean
  purpose: IEmailVerificationPurpose | null
  maskedTargetEmail: string | null
  expiresAt: string | null
  attemptsRemaining: number | null
}
