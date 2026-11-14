import { isAxiosError } from 'axios'

import { isSessionExpired } from './session-expired'

/**
 * Why something did not load or send, as the person needs to hear it: each kind has its own words
 * and drawing (see `problemCopy`). A rejection with a reason (a 4xx that says why) is not one of
 * these: whoever asked shows the reason the api gave.
 */
export type ProblemKind = 'offline' | 'server' | 'timeout' | 'expired' | 'rate' | 'unknown'

const TIMEOUT_CODES = new Set(['ECONNABORTED', 'ETIMEDOUT'])

function deviceIsOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

export function problemKind(error: unknown): ProblemKind {
  if (isSessionExpired(error)) return 'expired'

  if (!isAxiosError(error)) {
    if (error instanceof Error && deviceIsOffline()) return 'offline'
    return 'unknown'
  }

  const status = error.response?.status
  if (status === undefined) {
    // Nothing answered. Without network on the device it is the connection; with network, it is
    // the server that is not there, and the offline strip must not show.
    if (deviceIsOffline()) return 'offline'
    if (error.code && TIMEOUT_CODES.has(error.code)) return 'timeout'
    return 'server'
  }

  if (status === 429) return 'rate'
  if (status >= 500) return 'server'
  return 'unknown'
}
