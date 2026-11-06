import { isAxiosError } from 'axios'

export type PreviewOrderFailureKind = 'already_ordered' | 'expired' | 'not_found' | 'message'

/** What the buyer can do right there to unblock the order. */
export type PreviewOrderFix =
  | 'complete_profile'
  | 'pick_billing'
  | 'accept_consent'
  | 'transfer_only'

export interface IPreviewOrderFailure {
  kind: PreviewOrderFailureKind
  /** Text to show next to the form; only set when `kind === 'message'`. */
  message: string | null
  fix: PreviewOrderFix | null
}

export const PREVIEW_ORDER_FALLBACK_MESSAGE =
  'No pudimos enviar tu pedido. Revisa tu conexión e inténtalo de nuevo en un momento.'

const KIND_BY_MESSAGE_KEY: Record<string, Exclude<PreviewOrderFailureKind, 'message'>> = {
  'order.already_submitted': 'already_ordered',
  'order.preview_expired': 'expired',
}

/** Same keys the cart checkout answers with. */
const FIX_BY_MESSAGE_KEY: Record<string, PreviewOrderFix> = {
  'order.customer_profile_required': 'complete_profile',
  'billing.account_not_found': 'pick_billing',
  'billing.invoice_consent_required': 'accept_consent',
  'payment.card_unavailable': 'transfer_only',
}

function message(text: string, fix: PreviewOrderFix | null = null): IPreviewOrderFailure {
  return { kind: 'message', message: text, fix }
}

/**
 * Turns a failed `POST /preview/:token/orders` into what the client gallery
 * should show. The request is silent, so this is the only feedback the buyer gets.
 */
export function toPreviewOrderFailure(caught: unknown): IPreviewOrderFailure {
  if (!isAxiosError(caught) || !caught.response) return message(PREVIEW_ORDER_FALLBACK_MESSAGE)

  const { status } = caught.response
  const apiError = caught.response.data?.error as
    | { messageKey?: string; message?: string }
    | undefined
  const key = apiError?.messageKey

  const kind = key ? KIND_BY_MESSAGE_KEY[key] : undefined
  if (kind) return { kind, message: null, fix: null }
  if (status === 410) return { kind: 'expired', message: null, fix: null }
  if (status === 404) return { kind: 'not_found', message: null, fix: null }
  if (status >= 500) return message(PREVIEW_ORDER_FALLBACK_MESSAGE)

  return message(
    apiError?.message ?? PREVIEW_ORDER_FALLBACK_MESSAGE,
    key ? (FIX_BY_MESSAGE_KEY[key] ?? null) : null,
  )
}
