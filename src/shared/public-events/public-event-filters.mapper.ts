import type { IApiPublicEventFilterOptions, IPublicEventFilterOptions } from './public-event.types'

/** The api already sorts disciplines and provinces by name (collation `es`): the order stays. */
export function toPublicEventFilterOptions(
  api: IApiPublicEventFilterOptions,
): IPublicEventFilterOptions {
  return {
    eventTypes: api.eventTypes.map(({ id, name, count }) => ({ id, name, count })),
    provinces: api.provinces.map(({ id, name, count, hasEvents }) => ({
      id,
      name,
      count,
      hasEvents,
    })),
    months: api.months.map(({ month, count }) => ({ month, count })),
  }
}
