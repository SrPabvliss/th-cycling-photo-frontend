import { isAxiosError } from 'axios'

export function isRetryableHttpError(error: unknown): boolean {
  if (!isAxiosError(error)) return false

  const status = error.response?.status
  if (status === undefined) return true

  return status >= 500
}
