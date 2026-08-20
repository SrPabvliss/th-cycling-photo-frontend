import type { IApiUserGender } from '../responses/my-profile.response'

export interface IUpdateProfileRequest {
  firstName?: string
  lastName?: string
  countryId?: number
  provinceId?: number | null
  cantonId?: number | null
  birthDate?: string | null
  gender?: IApiUserGender | null
}
