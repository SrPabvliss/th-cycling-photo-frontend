import type {
  IApiOrganizerEvent,
  IOrganizerEvent,
} from '../types/responses/organizer-event.response'

export function toOrganizerEvent(api: IApiOrganizerEvent): IOrganizerEvent {
  return {
    id: api.id,
    name: api.name,
    startDate: api.startDate,
    endDate: api.endDate,
    photosUploaded: api.photosUploaded,
    photoQuota: api.photoQuota,
  }
}

export function toOrganizerEvents(items: IApiOrganizerEvent[]): IOrganizerEvent[] {
  return items.map(toOrganizerEvent)
}
