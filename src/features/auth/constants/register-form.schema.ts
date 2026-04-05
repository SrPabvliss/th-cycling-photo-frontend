import { z } from 'zod'

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
}

/** Field-level validators for individual form.Field bindings */
export const registerFieldValidators = {
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  firstName: z.string().min(1, 'El nombre es requerido').max(100),
  lastName: z.string().min(1, 'El apellido es requerido').max(100),
  phoneNumber: z
    .string()
    .min(8, 'Número inválido')
    .regex(/^\+\d+$/, 'Formato inválido'),
  countryId: z.number({ error: 'Selecciona un país' }),
}
