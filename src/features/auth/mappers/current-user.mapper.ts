import type { IApiCurrentUser, ICurrentUser } from '../types/responses/current-user.response'

export function toCurrentUser(api: IApiCurrentUser): ICurrentUser {
  return {
    id: api.id,
    email: api.email,
    firstName: api.firstName,
    lastName: api.lastName,
    role: api.role,
    profile: api.profile
      ? {
          countryId: api.profile.countryId,
          provinceId: api.profile.provinceId,
          cantonId: api.profile.cantonId,
        }
      : undefined,
    phones: api.phones ?? [],
  }
}
