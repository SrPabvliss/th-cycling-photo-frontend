import { format } from 'date-fns'

import type { IEventDetail } from '../types/responses/event-detail.response'
import type { IEventFormData } from '../types/event-form.types'
import type { ICreateEventRequest } from '../types/requests/create-event.request'
import type { IUpdateEventRequest } from '../types/requests/update-event.request'

export function toEventFormData(event: IEventDetail): IEventFormData {
  return {
    name: event.name,
    date: event.date.getTime(),
    location: event.location ?? '',
  }
}

export function toCreateEventRequest(form: IEventFormData): ICreateEventRequest {
  return {
    name: form.name.trim(),
    date: format(new Date(form.date!), 'yyyy-MM-dd'),
    location: form.location?.trim() || null,
  }
}

export function toUpdateEventRequest(form: IEventFormData): IUpdateEventRequest {
  return {
    name: form.name.trim(),
    date: format(new Date(form.date!), 'yyyy-MM-dd'),
    location: form.location?.trim() || null,
  }
}
