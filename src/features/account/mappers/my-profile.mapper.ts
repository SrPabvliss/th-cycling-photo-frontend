import type { IApiMyProfile, IMyProfile } from '../types/responses/my-profile.response'
import { toUserPhones } from './user-phone.mapper'

export function toMyProfile(api: IApiMyProfile): IMyProfile {
  return {
    id: api.id,
    email: api.email,
    firstName: api.firstName,
    lastName: api.lastName,
    avatarUrl: api.avatarUrl,
    countryId: api.countryId,
    provinceId: api.provinceId,
    cantonId: api.cantonId,
    birthDate: api.birthDate,
    gender: api.gender,
    phones: toUserPhones(api.phones),
  }
}
