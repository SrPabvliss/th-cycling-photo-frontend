import { format } from 'date-fns'

import type { IEventDetail } from '../types/responses/event-detail.response'
import type { IEventFormData } from '../types/event-form.types'
import type { ICreateEventRequest } from '../types/requests/create-event.request'
import type { IUpdateEventRequest } from '../types/requests/update-event.request'

export function toEventFormData(event: IEventDetail): IEventFormData {
  return {
    name: event.name,
    description: event.description ?? '',
    date: event.date.getTime(),
    provinceId: event.provinceId,
    cantonId: event.cantonId,
  }
}

export function toCreateEventRequest(form: IEventFormData): ICreateEventRequest {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    date: format(new Date(form.date!), 'yyyy-MM-dd'),
    location: null,
    provinceId: form.provinceId,
    cantonId: form.cantonId,
  }
}

export function toUpdateEventRequest(form: IEventFormData): IUpdateEventRequest {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    date: format(new Date(form.date!), 'yyyy-MM-dd'),
    location: null,
    provinceId: form.provinceId,
    cantonId: form.cantonId,
  }
}
