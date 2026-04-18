import { isAxiosError } from 'axios'

export type UploadErrorClassification = 'retry' | 'refresh-url' | 'permanent'

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503])
const PERMANENT_STATUS_CODES = new Set([400, 401, 404, 405, 413])

/**
 * Classifies an upload error to determine retry strategy.
 *
 * - `retry`: transient error (network, 5xx, 429) — p-retry handles backoff
 * - `refresh-url`: 403 — presigned URL expired, fetch a new one and retry
 * - `permanent`: 4xx client error — abort immediately (AbortError)
 */
export function classifyUploadError(error: unknown): UploadErrorClassification {
  if (!isAxiosError(error) || !error.response) return 'retry'

  const status = error.response.status
  if (status === 403) return 'refresh-url'
  if (RETRYABLE_STATUS_CODES.has(status)) return 'retry'
  if (PERMANENT_STATUS_CODES.has(status)) return 'permanent'
  return 'retry'
}

/** Extracts a user-facing error message from an upload error */
export function getUploadErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    return error.response?.data?.error?.message ?? error.message
  }
  return 'Upload failed'
}
