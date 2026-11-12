import { isAxiosError } from 'axios'

const MAX_RETRIES = 1

/**
 * Retry policy of every query. A 4xx is an answer, not a failure of the trip: asking again gets
 * the same one, and only delays the error the screen has to show.
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (isAxiosError(error)) {
    const status = error.response?.status
    if (status !== undefined && status >= 400 && status < 500) return false
  }

  return failureCount < MAX_RETRIES
}
