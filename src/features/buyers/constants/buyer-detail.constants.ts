export const CONSENT_TYPE_LABELS: Record<string, string> = {
  terms: 'Términos',
  privacy: 'Privacidad',
}

export const BUYER_DETAIL_FALLBACKS = {
  NO_NAME: 'Sin nombre registrado',
  NO_LOCATION: 'Sin ubicación',
  NO_DATA: 'Sin datos',
  NEVER: 'Nunca',
  NO_ORDERS: 'Sin pedidos',
  NO_CONSENTS: 'Sin consentimientos registrados.',
  READONLY_NOTICE:
    'Vista de solo lectura. Los datos personales los administra cada persona desde su perfil.',
} as const
