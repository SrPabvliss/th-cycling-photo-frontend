import { z } from 'zod'
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
}

/** Field-level validators for individual form.Field bindings */
export const registerFieldValidators = {
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  firstName: z.string().min(1, 'El nombre es requerido').max(100),
  lastName: z.string().min(1, 'El apellido es requerido').max(100),
  // phoneNumber: validated inline in RegisterForm.vue using intl-tel-input's
  // change-validity event (isPhoneValid ref). Kept out of the schema so the
  // schema doesn't lie about the source of truth.
  countryId: z.number({ error: 'Selecciona un país' }),
  acceptedTerms: z.literal(true, {
    error: 'Debes aceptar la política de privacidad y los términos',
  }),
}
