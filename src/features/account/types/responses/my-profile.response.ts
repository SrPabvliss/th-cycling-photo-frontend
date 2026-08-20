import type { IApiUserPhone, IUserPhone } from './user-phone.response'

export type IApiUserGender = 'female' | 'male' | 'other' | 'prefer_not_to_say'

export interface IApiMyProfile {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string
  countryId: number | null
  provinceId: number | null
  cantonId: number | null
  birthDate: string | null
  gender: IApiUserGender | null
  phones: IApiUserPhone[]
}

export type IUserGender = IApiUserGender

export interface IMyProfile {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string
  countryId: number | null
  provinceId: number | null
  cantonId: number | null
  birthDate: string | null
  gender: IUserGender | null
  phones: IUserPhone[]
}
