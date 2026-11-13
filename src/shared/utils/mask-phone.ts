const VISIBLE_DIGITS = 4
const MASK = '••••'

/**
 * A phone number with only its last digits showing, to say where a message goes without
 * putting the whole number on screen: "+593991234567" reads "•••• 4567".
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  return `${MASK} ${digits.slice(-VISIBLE_DIGITS)}`
}
