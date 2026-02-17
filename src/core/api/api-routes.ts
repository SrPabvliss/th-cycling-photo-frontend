const EVENTS_BASE = '/events'
const PHOTOS_BASE = '/photos'

export const API_ROUTES = {
  EVENTS: {
    BASE: EVENTS_BASE,
    GET_ALL: EVENTS_BASE,
    GET_BY_ID: (id: string) => `${EVENTS_BASE}/${id}`,
    CREATE: EVENTS_BASE,
    UPDATE: (id: string) => `${EVENTS_BASE}/${id}`,
    DELETE: (id: string) => `${EVENTS_BASE}/${id}`,
  },
  PHOTOS: {
    BASE: PHOTOS_BASE,
    BY_EVENT: (eventId: string) => `${EVENTS_BASE}/${eventId}/photos`,
    DETAIL: (id: string) => `${PHOTOS_BASE}/${id}`,
    SEARCH: `${PHOTOS_BASE}/search`,
    UPLOAD: (eventId: string) => `${EVENTS_BASE}/${eventId}/photos/upload`,
  },
} as const
