import type { IProfileFormData } from '../constants/profile-form.schema'

export type LocationLevel = 'country' | 'province'

const LOCATION_FIELDS_BELOW: Record<LocationLevel, (keyof IProfileFormData)[]> = {
  country: ['provinceId', 'cantonId'],
  province: ['cantonId'],
}

export function resetLocationBelow(level: LocationLevel, data: IProfileFormData): IProfileFormData {
  const clearedFields = Object.fromEntries(
    LOCATION_FIELDS_BELOW[level].map((field) => [field, null]),
  )
  return { ...data, ...clearedFields }
}
