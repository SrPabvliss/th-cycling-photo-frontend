/**
 * Builds a wa.me URL with a pre-filled message.
 * Phone should include country code (e.g., +593991234567).
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^+\d]/g, '')
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}

/**
 * Opens a WhatsApp chat in a new tab with a specific phone number.
 */
export function openWhatsApp(phone: string, message: string): void {
  window.open(buildWhatsAppUrl(phone, message), '_blank')
}

/**
 * Opens WhatsApp with a pre-filled message (no specific phone — user picks contact).
 * Useful when the backend returns a complete template.
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
  return `¡Hola ${data.customerFirstName}! 👋 Recibimos tu selección de ${data.photoCount} fotos del evento "${data.eventName}". Te escribimos para coordinar el pago. ¿Cómo prefieres realizarlo?`
}
