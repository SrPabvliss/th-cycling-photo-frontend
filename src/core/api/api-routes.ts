const USERS_BASE = '/users'
const PUBLIC_EVENTS_BASE = '/public/events'
const PREVIEW_PUBLIC_BASE = '/preview'
const AUTH_BASE = '/auth'
const EVENTS_BASE = '/events'
const PHOTOS_BASE = '/photos'
const PREVIEW_LINKS_BASE = '/preview-links'
const ORDERS_BASE = '/orders'
const DELIVERY_PUBLIC_BASE = '/delivery'
const NOTIFICATIONS_BASE = '/notifications'
const LOCATIONS_BASE = '/locations'
const PARTICIPANTS_BASE = '/participants'
const COUNTRIES_BASE = '/countries'
const PHOTO_CATEGORIES_BASE = '/photo-categories'
const OPERATOR_BASE = '/operator'
const PRICING_BASE = '/pricing'
const PAYMENTS_BASE = '/payments'

export const API_ROUTES = {
  AUTH: {
    BASE: AUTH_BASE,
    LOGIN: `${AUTH_BASE}/login`,
    REFRESH: `${AUTH_BASE}/refresh`,
    LOGOUT: `${AUTH_BASE}/logout`,
    ME: `${AUTH_BASE}/me`,
    REGISTER: `${AUTH_BASE}/register`,
    FORGOT_PASSWORD: `${AUTH_BASE}/forgot-password`,
    RESET_PASSWORD: `${AUTH_BASE}/reset-password`,
    VALIDATE_RESET_TOKEN: `${AUTH_BASE}/reset-password/validate`,
    CONSENTS: `${AUTH_BASE}/consents`,
  },
  USER_PHONES: {
    BASE: '/users/me/phones',
    BY_ID: (phoneId: string) => `/users/me/phones/${phoneId}`,
    SET_PRIMARY: (phoneId: string) => `/users/me/phones/${phoneId}/primary`,
  },
  MY_PROFILE: {
    BASE: '/users/me',
    AVATAR_PRESIGNED_URL: '/users/me/avatar/presigned-url',
    AVATAR_CONFIRM: '/users/me/avatar/confirm',
  },
  EVENTS: {
    BASE: EVENTS_BASE,
    GET_ALL: EVENTS_BASE,
    GET_BY_ID: (slug: string) => `${EVENTS_BASE}/${slug}`,
    CREATE: EVENTS_BASE,
    UPDATE: (id: string) => `${EVENTS_BASE}/${id}`,
    DELETE: (id: string) => `${EVENTS_BASE}/${id}`,
    STATS: `${EVENTS_BASE}/stats`,
    FEATURED: (id: string) => `${EVENTS_BASE}/${id}/featured`,
    OPERATORS: (id: string) => `${EVENTS_BASE}/${id}/operators`,
    OPERATOR: (eventId: string, userId: string) => `${EVENTS_BASE}/${eventId}/operators/${userId}`,
    REVIEW_QUEUE: (eventId: string) => `${EVENTS_BASE}/${eventId}/review-queue`,
    ASSETS: {
      GET_ALL: (id: string) => `${EVENTS_BASE}/${id}/assets`,
      PRESIGNED_URL: (id: string, assetType: string) =>
        `${EVENTS_BASE}/${id}/assets/${assetType}/presigned-url`,
      CONFIRM: (id: string, assetType: string) =>
        `${EVENTS_BASE}/${id}/assets/${assetType}/confirm`,
      DELETE: (id: string, assetType: string) => `${EVENTS_BASE}/${id}/assets/${assetType}`,
    },
  },
  PHOTOS: {
    BASE: PHOTOS_BASE,
    BY_EVENT: (eventId: string) => `${EVENTS_BASE}/${eventId}/photos`,
    DETAIL: (id: string) => `${PHOTOS_BASE}/${id}`,
    DETAIL_BY_SLUG: (slug: string) => `${PHOTOS_BASE}/detail/${slug}`,
    VIEW: (slug: string) => `${PHOTOS_BASE}/view/${slug}`,
    SEARCH: `${PHOTOS_BASE}/search`,
    UPLOAD: (eventId: string) => `${EVENTS_BASE}/${eventId}/photos`,
    PRESIGNED_URL: (eventId: string) => `${EVENTS_BASE}/${eventId}/photos/presigned-url`,
    CONFIRM_BATCH: (eventId: string) => `${EVENTS_BASE}/${eventId}/photos/confirm-batch`,
    RETOUCHED_PRESIGNED_URL: (id: string) => `${PHOTOS_BASE}/${id}/retouched/presigned-url`,
    RETOUCHED_CONFIRM: (id: string) => `${PHOTOS_BASE}/${id}/retouched/confirm`,
    DOWNLOAD: (id: string) => `${PHOTOS_BASE}/${id}/download`,
    CLASSIFY: (photoId: string) => `${PHOTOS_BASE}/${photoId}/classify`,
    SIMILAR: (photoId: string) => `${PHOTOS_BASE}/${photoId}/similar`,
    BULK_CLASSIFY: `${PHOTOS_BASE}/bulk-classify`,
    BULK_CATEGORY: `${PHOTOS_BASE}/bulk-category`,
    PENDING_RETOUCH: `${PHOTOS_BASE}/pending-retouch`,
    PARTICIPANTS_BY_PHOTO: (photoId: string) => `${PHOTOS_BASE}/${photoId}/participants`,
    RESUME_POINT: (eventId: string) => `${EVENTS_BASE}/${eventId}/photos/resume-point`,
    DOWNLOAD_MANIFEST: (eventId: string) => `${EVENTS_BASE}/${eventId}/photos/download-manifest`,
    BIB_CORRECTIONS: (photoId: string, bibId: string) =>
      `${PHOTOS_BASE}/${photoId}/bibs/${bibId}/corrections`,
    COLOR_CORRECTIONS: (photoId: string, colorId: string) =>
      `${PHOTOS_BASE}/${photoId}/colors/${colorId}/corrections`,
    MARK_REVIEWED: (photoId: string) => `${PHOTOS_BASE}/${photoId}/reviewed`,
    SET_RETOUCH_FLAG: (photoId: string) => `${PHOTOS_BASE}/${photoId}/retouch-flag`,
    ADD_BIB: (photoId: string) => `${PHOTOS_BASE}/${photoId}/bibs`,
    ADD_COLOR: (photoId: string) => `${PHOTOS_BASE}/${photoId}/colors`,
    DELETE_BIB: (photoId: string, bibId: string) => `${PHOTOS_BASE}/${photoId}/bibs/${bibId}`,
    DELETE_COLOR: (photoId: string, colorId: string) =>
      `${PHOTOS_BASE}/${photoId}/colors/${colorId}`,
    DELETE: (id: string) => `${PHOTOS_BASE}/${id}`,
  },
  PHOTO_CATEGORIES: {
    GET_ALL: PHOTO_CATEGORIES_BASE,
    CREATE: PHOTO_CATEGORIES_BASE,
    BY_EVENT: (eventId: string) => `${EVENTS_BASE}/${eventId}/photo-categories`,
    ASSIGN: (eventId: string) => `${EVENTS_BASE}/${eventId}/photo-categories`,
    UNASSIGN: (eventId: string, categoryId: string) =>
      `${EVENTS_BASE}/${eventId}/photo-categories/${categoryId}`,
  },
  GEAR_TYPES: {
    GET_ALL: '/gear-types',
  },
  PARTICIPANT_CATEGORIES: {
    GET_ALL: '/participant-categories',
  },
  EVENT_TYPES: {
    GET_ALL: '/event-types',
  },
  CLASSIFICATIONS: {
    BASE: PARTICIPANTS_BASE,
    PARTICIPANTS_BY_PHOTO: (photoId: string) => `${PHOTOS_BASE}/${photoId}/participants`,
    PARTICIPANT_DETAIL: (id: string) => `${PARTICIPANTS_BASE}/${id}`,
    UPDATE_PARTICIPANT: (id: string) => `${PARTICIPANTS_BASE}/${id}`,
    DELETE_PARTICIPANT: (id: string) => `${PARTICIPANTS_BASE}/${id}`,
  },
  PREVIEW_LINKS: {
    BASE: PREVIEW_LINKS_BASE,
    BY_EVENT: (eventId: string) => `${EVENTS_BASE}/${eventId}/preview-links`,
    CREATE: (eventId: string) => `${EVENTS_BASE}/${eventId}/preview-links`,
  },
  PUBLIC_EVENTS: {
    BASE: PUBLIC_EVENTS_BASE,
    GET_ALL: PUBLIC_EVENTS_BASE,
    GET_BY_SLUG: (slug: string) => `${PUBLIC_EVENTS_BASE}/${slug}`,
    PHOTOS: (slug: string) => `${PUBLIC_EVENTS_BASE}/${slug}/photos`,
    CREATE_ORDER: (slug: string) => `${PUBLIC_EVENTS_BASE}/${slug}/orders`,
  },
  PREVIEW_PUBLIC: {
    BASE: PREVIEW_PUBLIC_BASE,
    GET_BY_TOKEN: (token: string) => `${PREVIEW_PUBLIC_BASE}/${token}`,
    CUSTOMER_LOOKUP: (token: string) => `${PREVIEW_PUBLIC_BASE}/${token}/customer`,
    CREATE_ORDER: (token: string) => `${PREVIEW_PUBLIC_BASE}/${token}/orders`,
  },
  ORDERS: {
    BASE: ORDERS_BASE,
    GET_ALL: ORDERS_BASE,
    GET_BY_ID: (id: string) => `${ORDERS_BASE}/${id}`,
    STATS: `${ORDERS_BASE}/stats`,
    NOTIFY_PAYMENT_INFO: (id: string) => `${ORDERS_BASE}/${id}/notify-payment-info`,
    CONFIRM_PAYMENT: (id: string) => `${ORDERS_BASE}/${id}/confirm-payment`,
    GIFT: (id: string) => `${ORDERS_BASE}/${id}/gift`,
    CONVERT_TO_SALE: (id: string) => `${ORDERS_BASE}/${id}/convert-to-sale`,
    CONVERT_TO_GIFT: (id: string) => `${ORDERS_BASE}/${id}/convert-to-gift`,
    CANCEL: (id: string) => `${ORDERS_BASE}/${id}/cancel`,
    SEND_DELIVERY: (id: string) => `${ORDERS_BASE}/${id}/send-delivery`,
    REGENERATE_DELIVERY: (id: string) => `${ORDERS_BASE}/${id}/regenerate-delivery`,
    PAYMENT_METHOD: `${ORDERS_BASE}/payment-method`,
  },
  BUYERS: {
    GET_ALL: '/buyers',
  },
  CART: {
    GET: '/cart',
    ADD_ITEM: '/cart/items',
    REMOVE_ITEM: (photoId: string) => `/cart/items/${photoId}`,
    MERGE: '/cart/merge',
    CHECKOUT: '/cart/checkout',
  },
  DELIVERY_PUBLIC: {
    BASE: DELIVERY_PUBLIC_BASE,
    GET_BY_TOKEN: (token: string) => `${DELIVERY_PUBLIC_BASE}/${token}`,
  },
  NOTIFICATIONS: {
    BASE: NOTIFICATIONS_BASE,
    GET_ALL: NOTIFICATIONS_BASE,
    UNREAD_COUNT: `${NOTIFICATIONS_BASE}/unread-count`,
    MARK_AS_READ: (id: string) => `${NOTIFICATIONS_BASE}/${id}/read`,
    MARK_ALL_READ: `${NOTIFICATIONS_BASE}/read-all`,
  },
  LOCATIONS: {
    BASE: LOCATIONS_BASE,
    PROVINCES: `${LOCATIONS_BASE}/provinces`,
    CANTONS_BY_PROVINCE: (provinceId: number) =>
      `${LOCATIONS_BASE}/provinces/${provinceId}/cantons`,
  },
  COUNTRIES: {
    GET_ALL: COUNTRIES_BASE,
    PROVINCES: (countryId: number) => `${COUNTRIES_BASE}/${countryId}/provinces`,
  },
  USERS: {
    BASE: USERS_BASE,
    GET_ALL: USERS_BASE,
  },
  OPERATOR: {
    BASE: OPERATOR_BASE,
    DASHBOARD_SUMMARY: `${OPERATOR_BASE}/dashboard/summary`,
    DASHBOARD_EVENTS_ACTIVE: `${OPERATOR_BASE}/dashboard/events/active`,
    DASHBOARD_EVENTS_COMPLETED: `${OPERATOR_BASE}/dashboard/events/completed`,
    DASHBOARD_RECENT_ACTIVITY: `${OPERATOR_BASE}/dashboard/recent-activity`,
    DASHBOARD_REVIEW_QUEUE: `${OPERATOR_BASE}/dashboard/review-queue`,
    RETOUCH_QUEUE: (eventId: string) => `${OPERATOR_BASE}/events/${eventId}/retouch-queue`,
    RETOUCH_ORDERS: `${OPERATOR_BASE}/retouch/orders`,
    RETOUCH_ORDER_DETAIL: (orderId: string) => `${OPERATOR_BASE}/retouch/orders/${orderId}`,
  },
  PRICING: {
    BASE: PRICING_BASE,
    PREVIEW: `${PRICING_BASE}/preview`,
    TIERS: `${PRICING_BASE}/tiers`,
  },
  PAYMENTS: {
    BASE: PAYMENTS_BASE,
    CREATE_INTENT: `${PAYMENTS_BASE}/intent`,
    CONFIRM: `${PAYMENTS_BASE}/confirm`,
    TRANSACTION: (clientTransactionId: string) =>
      `${PAYMENTS_BASE}/transactions/${clientTransactionId}`,
  },
  TENANT_PROFILE: {
    BASE: '/tenants/me/profile',
    PAYOUT_METHODS: '/tenants/me/payout-methods',
    PAYOUT_METHOD: (id: string) => `/tenants/me/payout-methods/${id}`,
  },
} as const
