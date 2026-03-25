export const COUNTRY_CODE = '+593'

/**
 * Strips non-digit characters and removes leading 0.
 * "0991234567" → "991234567", "99 123 4567" → "991234567"
 */
export function cleanPhoneDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  return digits.startsWith('0') ? digits.slice(1) : digits
}

/**
 * Builds a full WhatsApp number: "+593991234567"
 */
export function buildWhatsAppNumber(raw: string): string {
  const digits = cleanPhoneDigits(raw)
  if (!digits) return ''
  return `${COUNTRY_CODE}${digits}`
}

/**
 * Formats a WhatsApp number for display: "+593 99 123 4567"
 */
export function formatWhatsAppNumber(raw: string): string {
  const d = cleanPhoneDigits(raw)
  if (!d) return ''
  const parts = [COUNTRY_CODE]
  if (d.length <= 2) parts.push(d)
  else if (d.length <= 5) parts.push(d.slice(0, 2), d.slice(2))
  else parts.push(d.slice(0, 2), d.slice(2, 5), d.slice(5))
  return parts.join(' ')
}

/**
 * Validates that a phone input has enough digits (≥7 after cleaning).
 */
export function isPhoneValid(raw: string): boolean {
  return cleanPhoneDigits(raw).length >= 7
}
