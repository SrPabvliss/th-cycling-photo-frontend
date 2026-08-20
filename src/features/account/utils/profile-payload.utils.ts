import type { IProfileFormData } from '../constants/profile-form.schema'
import type { IUpdateProfileRequest } from '../types/requests/update-profile.request'
import { composeBirthDate } from './birth-date.utils'

export function buildUpdatePayload(
  initial: IProfileFormData,
  current: IProfileFormData,
): IUpdateProfileRequest {
  const payload: IUpdateProfileRequest = {}

  if (current.firstName !== initial.firstName) payload.firstName = current.firstName
  if (current.lastName !== initial.lastName) payload.lastName = current.lastName
  if (current.countryId !== initial.countryId && current.countryId != null) {
    payload.countryId = current.countryId
  }
  if (current.provinceId !== initial.provinceId) payload.provinceId = current.provinceId
  if (current.cantonId !== initial.cantonId) payload.cantonId = current.cantonId

  const initialBirthDate = composeBirthDate(initial)
  const currentBirthDate = composeBirthDate(current)
  if (currentBirthDate !== initialBirthDate) payload.birthDate = currentBirthDate

  if (current.gender !== initial.gender) payload.gender = current.gender

  return payload
}

export function hasUnsavedChanges(initial: IProfileFormData, current: IProfileFormData): boolean {
  return Object.keys(buildUpdatePayload(initial, current)).length > 0
}
