const PREVIEW_PUBLIC_BASE = '/preview'
const AUTH_BASE = '/auth'
const EVENTS_BASE = '/events'
const PHOTOS_BASE = '/photos'
const PREVIEW_LINKS_BASE = '/preview-links'
const ORDERS_BASE = '/orders'
const DELIVERY_PUBLIC_BASE = '/delivery'
const LOCATIONS_BASE = '/locations'
const CYCLISTS_BASE = '/cyclists'

export const API_ROUTES = {
  AUTH: {
    BASE: AUTH_BASE,
    LOGIN: `${AUTH_BASE}/login`,
    REFRESH: `${AUTH_BASE}/refresh`,
    LOGOUT: `${AUTH_BASE}/logout`,
    ME: `${AUTH_BASE}/me`,
  },
  EVENTS: {
    BASE: EVENTS_BASE,
    GET_ALL: EVENTS_BASE,
    GET_BY_ID: (id: string) => `${EVENTS_BASE}/${id}`,
    CREATE: EVENTS_BASE,
    UPDATE: (id: string) => `${EVENTS_BASE}/${id}`,
    DELETE: (id: string) => `${EVENTS_BASE}/${id}`,
    STATS: `${EVENTS_BASE}/stats`,
    COVER_PRESIGNED_URL: (id: string) => `${EVENTS_BASE}/${id}/cover/presigned-url`,
    COVER_CONFIRM: (id: string) => `${EVENTS_BASE}/${id}/cover/confirm`,
    COVER_REMOVE: (id: string) => `${EVENTS_BASE}/${id}/cover`,
  },
  PHOTOS: {
    BASE: PHOTOS_BASE,
    BY_EVENT: (eventId: string) => `${EVENTS_BASE}/${eventId}/photos`,
    DETAIL: (id: string) => `${PHOTOS_BASE}/${id}`,
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
    CYCLISTS_BY_PHOTO: (photoId: string) => `${PHOTOS_BASE}/${photoId}/cyclists`,
    RESUME_POINT: (eventId: string) => `${EVENTS_BASE}/${eventId}/photos/resume-point`,
    DOWNLOAD_MANIFEST: (eventId: string) => `${EVENTS_BASE}/${eventId}/photos/download-manifest`,
  },
  CLASSIFICATIONS: {
    BASE: CYCLISTS_BASE,
    CYCLIST_DETAIL: (id: string) => `${CYCLISTS_BASE}/${id}`,
    UPDATE_CYCLIST: (id: string) => `${CYCLISTS_BASE}/${id}`,
    DELETE_CYCLIST: (id: string) => `${CYCLISTS_BASE}/${id}`,
  },
  PREVIEW_LINKS: {
    BASE: PREVIEW_LINKS_BASE,
    BY_EVENT: (eventId: string) => `${EVENTS_BASE}/${eventId}/preview-links`,
    CREATE: (eventId: string) => `${EVENTS_BASE}/${eventId}/preview-links`,
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
    CONFIRM_PAYMENT: (id: string) => `${ORDERS_BASE}/${id}/confirm-payment`,
    CANCEL: (id: string) => `${ORDERS_BASE}/${id}/cancel`,
    SEND_DELIVERY: (id: string) => `${ORDERS_BASE}/${id}/send-delivery`,
    REGENERATE_DELIVERY: (id: string) => `${ORDERS_BASE}/${id}/regenerate-delivery`,
  },
  DELIVERY_PUBLIC: {
    BASE: DELIVERY_PUBLIC_BASE,
    GET_BY_TOKEN: (token: string) => `${DELIVERY_PUBLIC_BASE}/${token}`,
  },
  LOCATIONS: {
    BASE: LOCATIONS_BASE,
    PROVINCES: `${LOCATIONS_BASE}/provinces`,
    CANTONS_BY_PROVINCE: (provinceId: number) =>
      `${LOCATIONS_BASE}/provinces/${provinceId}/cantons`,
  },
} as const
