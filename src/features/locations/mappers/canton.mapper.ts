import type { IApiCanton } from '../types/responses/canton.response'
import type { ICanton } from '../types/canton.types'

export function toCanton(api: IApiCanton): ICanton {
  return {
    id: api.id,
    name: api.name,
    provinceId: api.provinceId,
  }
}

export function toCantons(items: IApiCanton[]): ICanton[] {
  return items.map(toCanton)
}
