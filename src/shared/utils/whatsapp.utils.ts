import { buildWhatsAppNumber } from './phone.utils'

// We use api.whatsapp.com/send instead of wa.me because the wa.me intermediate
// "Continue to chat" page mangles non-BMP emoji code points (surrogate pairs)
// on several platforms, replacing them with U+FFFD before forwarding to the
// app. The api.whatsapp.com endpoint hands the text straight to the chat
// composer with the bytes intact.
const WHATSAPP_BASE = 'https://api.whatsapp.com/send'

/**
 * Builds a WhatsApp deep link with a pre-filled message. When `phone` is empty
 * or cannot be normalised to a valid Ecuador number, the phone segment is
 * omitted so the user picks a contact manually.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = phone ? buildWhatsAppNumber(phone) : ''
  // api.whatsapp.com expects the phone without the leading '+'.
  const phoneParam = normalized.length > 1 ? normalized.replace(/^\+/, '') : ''
  const text = encodeURIComponent(message)
  return phoneParam
    ? `${WHATSAPP_BASE}?phone=${phoneParam}&text=${text}`
    : `${WHATSAPP_BASE}?text=${text}`
}

/**
 * Opens a WhatsApp chat in a new tab. Phone is normalised to E.164 (+593…)
 * via the shared phone util; if normalisation fails, falls back to the
 * contact picker.
 */
export function openWhatsApp(phone: string | null | undefined, message: string): void {
  window.open(buildWhatsAppUrl(phone ?? '', message), '_blank')
}

/**
 * Opens WhatsApp with a pre-filled message and no specific recipient. Kept
 * for callers that explicitly want the picker behaviour.
 */
export function openWhatsAppWithTemplate(template: string): void {
  window.open(`${WHATSAPP_BASE}?text=${encodeURIComponent(template)}`, '_blank')
}
