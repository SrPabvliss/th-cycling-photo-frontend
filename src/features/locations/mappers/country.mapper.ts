import type { IApiCountry } from '../types/responses/country.response'
import type { ICountry } from '../types/country.types'

export function toCountry(api: IApiCountry): ICountry {
  return { id: api.id, name: api.name, isoCode: api.isoCode }
}

export function toCountries(items: IApiCountry[]): ICountry[] {
  return items.map(toCountry)
}
