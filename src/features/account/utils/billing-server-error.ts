import { isAxiosError } from 'axios'

import type { IApiError } from '@/core/http/http-response.interface'

export interface IBillingServerError {
  message: string
  messageKey: string | null
  fields: Record<string, string[]> | null
}

const IDENTIFICATION_FIELD = 'idNumber'
const IDENTIFICATION_KEY_PREFIX = 'billing.identification'

export function readBillingServerError(caught: unknown, fallback: string): IBillingServerError {
  const apiError = isAxiosError<{ error?: Partial<IApiError> }>(caught)
    ? caught.response?.data?.error
    : undefined
  return {
    message: apiError?.message ?? fallback,
    messageKey: apiError?.messageKey ?? null,
    fields: apiError?.fields ?? null,
  }
}

export function identificationMessageOf(error: IBillingServerError): string | null {
  const fieldMessages = error.fields?.[IDENTIFICATION_FIELD]
  if (fieldMessages?.length) return fieldMessages[0] ?? error.message
  if (error.messageKey?.startsWith(IDENTIFICATION_KEY_PREFIX)) return error.message
  return null
}
