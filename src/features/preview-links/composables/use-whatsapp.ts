/**
 * Builds a WhatsApp wa.me URL with pre-filled message.
 *
 * @param phone - Phone number (with country code, e.g. "593987654321")
 * @param message - Pre-filled message text
 * @returns Full wa.me URL
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

/**
 * Opens WhatsApp in a new tab with a pre-filled message.
 */
export function openWhatsApp(phone: string, message: string): void {
  const url = buildWhatsAppUrl(phone, message)
  window.open(url, '_blank', 'noopener,noreferrer')
}
