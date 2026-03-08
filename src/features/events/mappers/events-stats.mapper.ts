import type { IApiEventsStats } from '../types/responses/events-stats.response'

export function toEventsStats(api: IApiEventsStats): IApiEventsStats {
  return {
    totalEvents: api.totalEvents,
    totalPhotos: api.totalPhotos,
    totalStorageBytes: api.totalStorageBytes,
  }
}
