import { isAxiosError } from 'axios'

/** What went wrong opening a delivery link. */
export type DeliveryProblem =
  | 'expired'
  | 'access-limit'
  | 'not-found'
  | 'rate-limited'
  | 'network'
  | 'unknown'

export function deliveryProblem(error: unknown): DeliveryProblem {
  if (!isAxiosError(error)) return 'unknown'
  if (!error.response) return 'network'
  const key = (error.response.data as { error?: { messageKey?: string } } | undefined)?.error
    ?.messageKey
  if (key === 'delivery.access_limit_exceeded') return 'access-limit'
  if (key === 'delivery.link_expired' || error.response.status === 410) return 'expired'
  if (error.response.status === 404) return 'not-found'
  if (error.response.status === 429) return 'rate-limited'
  return 'unknown'
}
