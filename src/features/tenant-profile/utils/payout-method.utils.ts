import { isAxiosError } from 'axios'

import { formatWhatsAppNumber } from '@/shared/utils/phone.utils'

const EC_DIAL_CODE = '+593'

export function formatPayphoneReceiver(receiverIdentifier: string | null): string {
  if (!receiverIdentifier) return ''
  return formatWhatsAppNumber(`${EC_DIAL_CODE}${receiverIdentifier}`)
}

export function readApiErrorMessage(caught: unknown, fallback: string): string {
  if (!isAxiosError(caught)) return fallback
  return caught.response?.data?.error?.message ?? fallback
}

export function readApiErrorRule(caught: unknown): string | null {
  if (!isAxiosError(caught)) return null
  return caught.response?.data?.error?.details?.rule ?? null
}
