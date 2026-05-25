import type { IEventDetail } from '../types/responses/event-detail.response'
import type { IEventFormData } from '../types/event-form.types'
import type { ICreateEventRequest } from '../types/requests/create-event.request'
import type { IUpdateEventRequest } from '../types/requests/update-event.request'

export function toEventFormData(event: IEventDetail): IEventFormData {
  return {
    name: event.name,
    startDate: event.startDate.getTime(),
    endDate: event.endDate.getTime(),
    provinceId: event.provinceId,
    cantonId: event.cantonId,
    eventTypeId: 1,
  }
}

export function toCreateEventRequest(form: IEventFormData): ICreateEventRequest {
  return {
    name: form.name.trim(),
    startDate: new Date(form.startDate!).toISOString(),
    endDate: new Date(form.endDate!).toISOString(),
    provinceId: form.provinceId,
    cantonId: form.cantonId,
    eventTypeId: form.eventTypeId,
  }
}

export function toUpdateEventRequest(form: IEventFormData): IUpdateEventRequest {
  return {
    name: form.name.trim(),
    startDate: new Date(form.startDate!).toISOString(),
    endDate: new Date(form.endDate!).toISOString(),
    provinceId: form.provinceId,
    cantonId: form.cantonId,
    eventTypeId: form.eventTypeId,
  }
}
