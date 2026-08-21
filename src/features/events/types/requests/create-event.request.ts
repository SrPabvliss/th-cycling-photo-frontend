import type { IEventConfigurationSelectionRequest } from './event-configuration.request'

export interface ICreateEventRequest {
  name: string
  startDate: string
  endDate: string
  provinceId?: number | null
  cantonId?: number | null
  eventTypeId: number
  configuration?: IEventConfigurationSelectionRequest
}
