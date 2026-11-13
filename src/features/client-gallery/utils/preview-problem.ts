import { isAxiosError } from 'axios'

import { checkoutProblem, type CheckoutProblem } from '@/shared/utils/checkout-error'

/** What went wrong with a preview link or its order, beyond what any checkout can say. */
export type PreviewProblem =
  | 'expired'
  | 'not-found'
  | 'already-ordered'
  | 'not-available'
  | 'photos-changed'
  | CheckoutProblem

const PROBLEM_BY_KEY: Record<string, PreviewProblem> = {
  'order.preview_expired': 'expired',
  'preview.link_expired': 'expired',
  'order.already_submitted': 'already-ordered',
  'order.preview_not_available': 'not-available',
  'order.photos_not_in_preview': 'photos-changed',
}

export function previewProblem(error: unknown): PreviewProblem {
  if (isAxiosError(error) && error.response) {
    const key = (error.response.data as { error?: { messageKey?: string } } | undefined)?.error
      ?.messageKey
    if (key && PROBLEM_BY_KEY[key]) return PROBLEM_BY_KEY[key]
    if (error.response.status === 410) return 'expired'
    if (error.response.status === 404) return 'not-found'
  }
  return checkoutProblem(error)
}
