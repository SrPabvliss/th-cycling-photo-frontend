import utils from 'intl-tel-input/utils'

const FORMAT = { E164: 0, INTERNATIONAL: 1, NATIONAL: 2, RFC3966: 3 } as const

/**
 * Display internacional segun pais detectado en E.164.
 * Input asumido E.164 ("+573170672897"). Si parse falla, passthrough.
 */
export function formatWhatsAppNumber(raw: string): string {
  if (!raw) return ''
  return utils.formatNumber(raw, undefined, FORMAT.INTERNATIONAL) || raw
}

/**
 * E.164 normalizado para construir wa.me / api.whatsapp.com links.
 */
export function buildWhatsAppNumber(raw: string): string {
  if (!raw) return ''
  return utils.formatNumber(raw, undefined, FORMAT.E164) || raw
}

export function isPhoneValid(raw: string): boolean {
  if (!raw) return false
  return utils.isValidNumber(raw, undefined)
}
