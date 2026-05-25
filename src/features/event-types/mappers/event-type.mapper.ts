import type { IApiEventType, IEventType } from '../types/responses/event-type.response'

export const toEventType = (api: IApiEventType): IEventType => ({
  id: api.id,
  name: api.name,
})

export const toEventTypes = (items: IApiEventType[]): IEventType[] => items.map(toEventType)
