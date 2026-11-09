import type { ConfigurationItemId } from '../types/configuration-item.types'

export const WRONG_PASSWORD_MESSAGE = 'Contraseña incorrecta. Inténtalo de nuevo.'
export const PAYOUT_FAILED_MESSAGE =
  'No pudimos crear el método de pago. Revisa los datos e inténtalo de nuevo.'

export const CREATING_STEPS = [
  'Creando el evento',
  'Subiendo la portada',
  'Creando las categorías de foto',
] as const

export const PAYOUT_ITEM_IDS: ConfigurationItemId[] = ['payphone', 'bankTransfer']

export const NO_SLOT_KEY = 'event.no_contract_available'

export const PROFILE_LABELS: Record<'publicName' | 'whatsapp' | 'watermark', string> = {
  publicName: 'el nombre público',
  whatsapp: 'el WhatsApp',
  watermark: 'la marca de agua',
}

export const WRONG_PASSWORD_KEY = 'auth.password_confirmation_invalid'
