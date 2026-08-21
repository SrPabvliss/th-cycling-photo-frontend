import { z } from 'zod'
import { registerFieldValidators } from '@/features/auth/constants/register-form.schema'
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

export interface IPasswordFormData {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export const PASSWORD_FORM_DEFAULTS: IPasswordFormData = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
}

export const passwordFieldValidators = {
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: registerFieldValidators.password,
  confirmNewPassword: z.string().min(1, 'Confirma la nueva contraseña'),
}

export interface IEmailFormData {
  newEmail: string
  currentPassword: string
}

export const EMAIL_FORM_DEFAULTS: IEmailFormData = {
  newEmail: '',
  currentPassword: '',
}

export const emailFieldValidators = {
  newEmail: registerFieldValidators.email,
  currentPassword: passwordFieldValidators.currentPassword,
}
