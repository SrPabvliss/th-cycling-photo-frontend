import type { IConfigurationItemDefinition } from '../types/configuration-item.types'

export const CONFIGURATION_ITEMS: IConfigurationItemDefinition[] = [
  { id: 'publicName', label: 'Nombre público', icon: 'building', requiresPassword: false },
  { id: 'watermark', label: 'Marca de agua', icon: 'image', requiresPassword: false },
  { id: 'whatsapp', label: 'WhatsApp de contacto', icon: 'whatsapp', requiresPassword: false },
  { id: 'payphone', label: 'Payphone', icon: 'card', requiresPassword: true },
  { id: 'bankTransfer', label: 'Transferencia bancaria', icon: 'bank', requiresPassword: true },
]

export const MISSING_SUMMARY = 'Tu perfil no tiene este dato · complétalo aquí'
export const NEW_DATA_SUMMARY = 'Dato nuevo solo para este evento'
export const UNVERIFIED_SUFFIX = ' · aún sin verificar'
export const NO_PAYOUT_METHOD_LEFT = 'Un evento necesita al menos un método de cobro'
export const EC_CALLING_CODE = '+593'
