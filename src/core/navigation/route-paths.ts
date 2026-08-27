export const ROUTE_PATHS = {
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ACCOUNT: '/account',
  BUSINESS_PROFILE: '/business-profile',
  BUYERS: '/buyers',
  CHECKOUT: '/checkout',
  PAYMENT_BOX: '/checkout/payment',
  PAYMENT_RETURN: '/payments/return',
  EVENTS: '/events',
  ORDERS: '/orders',
  ORGANIZERS: '/organizers',
  PHOTOS: '/photos',
  PREVIEW_LINKS: '/preview-links',
  PUBLIC_GALLERY: '/gallery',
  RETOUCH: '/operator/retouch',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  TENANT_TERMS: '/tenant-terms',
} as const

export function checkoutPath(eventId: string): string {
  return `${ROUTE_PATHS.CHECKOUT}/${eventId}`
}

export function segmentOf(path: string): string {
  return path.replace(/^\//, '')
}

