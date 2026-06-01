import { PAYMENT_INFO } from '@/shared/constants/payment'
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

/**
 * Builds the payment-info template with bank details and an editable price
 * placeholder. The operator fills the price inside WhatsApp before sending.
 *
 * We deliberately avoid emojis here: WhatsApp's URL prefill mangles a chunk
 * of common emoji code points on some platforms and they ended up reaching
 * the customer as � replacement characters. Plain text bullets are
 * universally rendered.
 */
export function buildPaymentInfoTemplate(data: {
  customerFirstName: string
  photoCount: number
  eventName: string
  totalPrice: number | null
  currency: string | null
}): string {
  const priceLine =
    data.totalPrice === null
      ? 'El valor a pagar es de $[ESCRIBE EL PRECIO AQUÍ].'
      : `El valor a pagar es de ${formatCurrencyPlain(data.totalPrice, data.currency)}.`

  const lines = [
    `Hola ${data.customerFirstName},`,
    '',
    `Recibimos tu orden de ${data.photoCount} fotos del evento "${data.eventName}".`,
    '',
    priceLine,
    '',
    'Datos para realizar el pago:',
    `- Banco: ${PAYMENT_INFO.bankName}`,
    `- Tipo de cuenta: ${PAYMENT_INFO.accountType}`,
    `- Número: ${PAYMENT_INFO.accountNumber}`,
    `- Titular: ${PAYMENT_INFO.accountHolder}`,
    '',
    'Cuando realices el pago, por favor envíanos el comprobante por este medio.',
    '',
    'Gracias.',
  ]
  return lines.join('\n')
}

function formatCurrencyPlain(value: number, currency: string | null): string {
  const code = currency ?? 'USD'
  const symbol = code === 'USD' ? '$' : `${code} `
  return `${symbol}${value.toFixed(2)}`
}

/**
 * Builds the delivery template (post-payment) with the download link.
 */
export function buildDeliveryTemplate(data: {
  customerFirstName: string
  photoCount: number
  deliveryUrl: string
}): string {
  return `Hola ${data.customerFirstName}, tu pago fue confirmado. Aquí tienes tus ${data.photoCount} fotos en alta calidad: ${data.deliveryUrl}. El link estará disponible por 7 días. ¡Gracias!`
}
