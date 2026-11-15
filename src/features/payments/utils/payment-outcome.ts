/** How long a confirmation may take before the screen says it is taking longer than usual. */
export const LATE_AFTER_MS = 10_000

/**
 * What the buyer is told after the gateway sends them back.
 * - `confirming`: waiting for the answer, for a few seconds.
 * - `late`: still no answer, or a charge approved but not settled yet. Never shown as paid.
 * - `confirmed`: charged and the photos handed over.
 * - `declined`: not charged.
 * - `failed`: the answer could not be asked for; trying again is safe.
 */
export type PaymentOutcome =
  | 'confirming'
  | 'late'
  | 'confirmed'
  | 'declined'
  | 'cancelled'
  | 'failed'

/** The answer to confirming the payment. */
export interface IConfirmAnswer {
  approved: boolean
  settled: boolean
}

/** The state of the transaction, read on its own. */
export interface ITransactionAnswer {
  status: string
}

const DECLINED_STATUSES = new Set(['declined', 'expired', 'reversed', 'cancelled'])
const APPROVED_STATUS = 'approved'

export function paymentOutcome(
  answer: IConfirmAnswer | ITransactionAnswer | null,
  elapsedMs: number,
  requestFailed: boolean,
): PaymentOutcome {
  if (answer && 'approved' in answer) {
    if (!answer.approved) return 'declined'
    return answer.settled ? 'confirmed' : 'late'
  }
  if (answer) {
    if (answer.status === APPROVED_STATUS) return 'confirmed'
    if (DECLINED_STATUSES.has(answer.status)) return 'declined'
  }
  if (!answer && requestFailed) return 'failed'
  return elapsedMs >= LATE_AFTER_MS ? 'late' : 'confirming'
}
