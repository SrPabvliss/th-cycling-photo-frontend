import { isAxiosError } from 'axios'

import { isTimeoutError } from '@/core/http/problem-kind'

const MAX_RETRIES = 1

/**
 * Retry policy of every query. A 4xx is an answer, not a failure of the trip: asking again gets
 * the same one, and only delays the error the screen has to show. A request that ran out of time
 * already waited its whole limit: the screen says it is slow and offers to try again.
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (isTimeoutError(error)) return false
  if (isAxiosError(error)) {
    const status = error.response?.status
    if (status !== undefined && status >= 400 && status < 500) return false
  }

  return failureCount < MAX_RETRIES
}
