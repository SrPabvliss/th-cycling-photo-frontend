export const ROUTE_NAMES = {
  // Auth
  AUTH_LOGIN: 'auth-login',
  AUTH_REGISTER: 'auth-register',
  AUTH_FORGOT_PASSWORD: 'auth-forgot-password',
  AUTH_RESET_PASSWORD: 'auth-reset-password',

  // Account
  ACCOUNT_PROFILE: 'account-profile',
  ACCOUNT_VERIFY_EMAIL: 'account-verify-email',
  ACCOUNT_ORDERS: 'account-orders',
  ACCOUNT_ORDER_DETAIL: 'account-order-detail',

  // Buyers
  BUYERS_LIST: 'buyers-list',
  BUYERS_DETAIL: 'buyers-detail',

  // Cart
  CART_CHECKOUT: 'cart-checkout',

  // Client gallery
  CLIENT_GALLERY: 'client-gallery',

  // Contracts
  CONTRACT_ACCEPT: 'contract-accept',

  // Delivery
  DELIVERY: 'delivery',

  // Events
  EVENTS_LIST: 'events-list',
  EVENTS_CREATE: 'events-create',
  EVENTS_DETAIL: 'events-detail',
  EVENTS_EDIT: 'events-edit',
  EVENTS_CONFIGURATION_EDIT: 'events-configuration-edit',

  // Landing
  LANDING: 'landing',

  // Legal
  LEGAL_PRIVACY: 'legal-privacy',
  LEGAL_TERMS: 'legal-terms',
  LEGAL_TENANT_TERMS: 'legal-tenant-terms',

  // Orders
  ORDERS_LIST: 'orders-list',

  // Organizers
  ORGANIZERS_LIST: 'organizers-list',
  ORGANIZERS_DETAIL: 'organizers-detail',

  // Payments
  PAYMENT_RETURN: 'payment-return',
  PAYMENT_BOX: 'payment-box',

  // Photos
  PHOTOS_GALLERY: 'photos-gallery',
  PHOTOS_UPLOAD: 'photos-upload',
  PHOTOS_DETAIL: 'photos-detail',

  // Preview links
  PREVIEW_LINKS_LIST: 'preview-links-list',
  PREVIEW_LINKS_CREATE: 'preview-links-create',

  // Public gallery
  PUBLIC_GALLERY_EVENT_LIST: 'public-event-list',
  PUBLIC_GALLERY_EVENT_GALLERY: 'public-event-gallery',

  // Retouch
  RETOUCH_OPERATOR_QUEUE: 'operator-retouch-queue',
  RETOUCH_OPERATOR_WORKSPACE: 'operator-retouch-workspace',
  RETOUCH_EVENT_QUEUE: 'operator-event-retouch-queue',
  RETOUCH_EVENT_WORKSPACE: 'operator-event-retouch-workspace',

  // Review
  REVIEW_WORKSPACE: 'review-workspace',
  REVIEW_SINGLE_PHOTO: 'review-single-photo',

  // Tenant profile
  BUSINESS_PROFILE: 'business-profile',
} as const
