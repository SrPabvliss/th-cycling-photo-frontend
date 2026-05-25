import { PAYMENT_INFO } from '@/shared/constants/payment'
import { buildWhatsAppNumber } from './phone.utils'

// Emojis as explicit unicode escapes to avoid encoding mismatches when the
// source file is read by tooling with non-UTF-8 defaults.
const EMOJI = {
  wave: '\u{1F44B}',
  check: '\u{2705}',
  party: '\u{1F389}',
  refresh: '\u{1F504}',
  camera: '\u{1F4F8}',
  bank: '\u{1F3E6}',
  clipboard: '\u{1F4CB}',
  hash: '\u{1F522}',
  person: '\u{1F464}',
  money: '\u{1F4B5}',
} as const

/**
 * Builds a wa.me URL with a pre-filled message. When `phone` is empty or
 * cannot be normalized to a valid Ecuador number, returns the picker URL
 * (no phone segment) so the operator can pick a contact manually.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = phone ? buildWhatsAppNumber(phone) : ''
  const phoneSegment = normalized.length > 1 ? normalized : ''
  return `https://wa.me/${phoneSegment}?text=${encodeURIComponent(message)}`
}

/**
 * Opens a WhatsApp chat in a new tab. Phone is normalized to E.164 (+593…)
 * via the shared phone util; if normalization fails, falls back to the
 * contact picker.
 */
export function openWhatsApp(phone: string | null | undefined, message: string): void {
  window.open(buildWhatsAppUrl(phone ?? '', message), '_blank')
}

/**
 * Opens WhatsApp with a pre-filled message and no specific recipient.
 * Kept for callers that explicitly want the picker behavior.
 */
export function openWhatsAppWithTemplate(template: string): void {
  window.open(`https://wa.me/?text=${encodeURIComponent(template)}`, '_blank')
}

/**
 * Builds the payment coordination template for pending orders.
 */
export function buildPaymentTemplate(data: {
  customerFirstName: string
  photoCount: number
  eventName: string
}): string {
  return `¡Hola ${data.customerFirstName}! ${EMOJI.wave} Recibimos tu selección de ${data.photoCount} fotos del evento "${data.eventName}". Te escribimos para coordinar el pago. ¿Cómo prefieres realizarlo?`
}

/**
 * Builds the payment-info template with bank details and an editable
 * price placeholder. The operator fills the price inside WhatsApp before
 * hitting send.
 */
export function buildPaymentInfoTemplate(data: {
  customerFirstName: string
  photoCount: number
  eventName: string
}): string {
  const lines = [
    `¡Hola ${data.customerFirstName}! ${EMOJI.wave}`,
    '',
    `Recibimos tu orden de ${data.photoCount} fotos del evento "${data.eventName}".`,
    '',
    `${EMOJI.money} El valor a pagar es de $[ESCRIBE EL PRECIO AQUÍ].`,
    '',
    'Datos para realizar el pago:',
    `${EMOJI.bank} ${PAYMENT_INFO.bankName}`,
    `${EMOJI.clipboard} ${PAYMENT_INFO.accountType}`,
    `${EMOJI.hash} Número: ${PAYMENT_INFO.accountNumber}`,
    `${EMOJI.person} Titular: ${PAYMENT_INFO.accountHolder}`,
    '',
    'Cuando realices el pago, por favor envíanos el comprobante por este medio.',
    '',
    '¡Gracias!',
  ]
  return lines.join('\n')
}

/**
 * Builds the delivery template (post-payment) with the download link.
 */
export function buildDeliveryTemplate(data: {
  customerFirstName: string
  photoCount: number
  deliveryUrl: string
}): string {
  return `¡Hola ${data.customerFirstName}! ${EMOJI.check} Aquí tienes tus ${data.photoCount} fotos en alta calidad: ${data.deliveryUrl}. El link estará disponible por 7 días. ¡Gracias! ${EMOJI.party}`
}
