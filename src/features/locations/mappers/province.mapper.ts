import type { IApiProvince } from '../types/responses/province.response'
import type { IProvince } from '../types/province.types'

export function toProvince(api: IApiProvince): IProvince {
  return {
    id: api.id,
    name: api.name,
    code: api.code,
  }
}

export function toProvinces(items: IApiProvince[]): IProvince[] {
  return items.map(toProvince)
}
