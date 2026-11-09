import type { IUserPhone } from '../types/responses/user-phone.response'
import type { IUpdatePhoneRequest } from '../types/requests/phone.request'

export function buildLabelPayload(
  currentLabel: string,
  previousLabel: string | null,
): string | null | undefined {
  const trimmed = currentLabel.trim()
  const previous = previousLabel ?? ''
  if (trimmed === previous) return undefined
  return trimmed === '' ? null : trimmed
}

export function buildUpdatePhonePayload(
  current: { label: string; phoneNumber: string; isValid: boolean; isWhatsapp?: boolean },
  previous: IUserPhone,
): IUpdatePhoneRequest {
  const label = buildLabelPayload(current.label, previous.label)
  const phoneNumber =
    current.isValid && current.phoneNumber !== previous.phoneNumber
      ? current.phoneNumber
      : undefined
  const isWhatsapp =
    current.isWhatsapp !== undefined && current.isWhatsapp !== previous.isWhatsapp
      ? current.isWhatsapp
      : undefined

  return {
    ...(label !== undefined ? { label } : {}),
    ...(phoneNumber !== undefined ? { phoneNumber } : {}),
    ...(isWhatsapp !== undefined ? { isWhatsapp } : {}),
  }
}
