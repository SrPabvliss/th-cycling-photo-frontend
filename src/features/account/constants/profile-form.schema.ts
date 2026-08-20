import { z } from 'zod'
import type { IUserGender } from '../types/responses/my-profile.response'

export interface IProfileFormData {
  firstName: string
  lastName: string
  countryId: number | null
  provinceId: number | null
  cantonId: number | null
  birthDay: number | null
  birthMonth: number | null
  birthYear: number | null
  gender: IUserGender | null
}

export const PROFILE_FORM_DEFAULTS: IProfileFormData = {
  firstName: '',
  lastName: '',
  countryId: null,
  provinceId: null,
  cantonId: null,
  birthDay: null,
  birthMonth: null,
  birthYear: null,
  gender: null,
}

export const profileFieldValidators = {
  firstName: z.string().min(1, 'El nombre es requerido').max(100),
  lastName: z.string().min(1, 'El apellido es requerido').max(100),
  countryId: z.number({ error: 'Selecciona un país' }),
}
