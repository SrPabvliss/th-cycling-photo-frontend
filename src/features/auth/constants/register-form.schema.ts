import { z } from 'zod'

import { isAccountPassword, PASSWORD_RULE_MESSAGE } from '@/shared/auth/password-rule'
import type { Gender } from '../types/requests/register.request'

export interface IRegisterFormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phoneNumber: string
  countryId: number | null
  provinceId: number | null
  cantonId: number | null
  birthDay: number | null
  birthMonth: number | null
  birthYear: number | null
  gender: Gender | null
  acceptedTerms: boolean
  guardianConsent: boolean
  /** Optional and separate from the terms: birthday and holiday greetings by email. */
  communityEmails: boolean
}

export const REGISTER_FORM_DEFAULTS: IRegisterFormData = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  countryId: null,
  provinceId: null,
  cantonId: null,
  birthDay: null,
  birthMonth: null,
  birthYear: null,
  gender: null,
  acceptedTerms: false,
  guardianConsent: false,
  communityEmails: false,
}

/** Field-level validators for individual form.Field bindings */
export const registerFieldValidators = {
  email: z
    .string()
    .trim()
    .min(1, 'Escribe un correo válido, como tu@correo.com.')
    .email('Escribe un correo válido, como tu@correo.com.'),
  password: z.string().refine(isAccountPassword, PASSWORD_RULE_MESSAGE),
  confirmPassword: z.string().min(1, 'Repite tu contraseña.'),
  firstName: z.string().trim().min(1, 'Escribe tu nombre.').max(100, 'Escribe tu nombre.'),
  lastName: z.string().trim().min(1, 'Escribe tu apellido.').max(100, 'Escribe tu apellido.'),
  // phoneNumber: validated inline in RegisterForm.vue using intl-tel-input's
  // change-validity event (isPhoneValid ref). Kept out of the schema so the
  // schema doesn't lie about the source of truth.
  countryId: z.number({ error: 'Elige tu país.' }),
  acceptedTerms: z.literal(true, {
    error: 'Acepta la política y los términos para continuar.',
  }),
}
