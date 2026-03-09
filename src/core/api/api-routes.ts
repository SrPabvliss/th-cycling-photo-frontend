const EVENTS_BASE = '/events'
const PHOTOS_BASE = '/photos'
const LOCATIONS_BASE = '/locations'

export const API_ROUTES = {
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
  },
  LOCATIONS: {
    BASE: LOCATIONS_BASE,
    PROVINCES: `${LOCATIONS_BASE}/provinces`,
    CANTONS_BY_PROVINCE: (provinceId: number) =>
      `${LOCATIONS_BASE}/provinces/${provinceId}/cantons`,
  },
} as const
