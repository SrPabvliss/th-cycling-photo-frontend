import { z } from 'zod'

import type { ILoginFormData } from '../types/login-form.types'

export const LOGIN_FORM_DEFAULTS: ILoginFormData = {
  email: '',
  password: '',
}

export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Ingresa un correo valido')
    .max(255, 'Maximo 255 caracteres'),
  password: z.string().min(1, 'La contrasena es requerida').max(128, 'Maximo 128 caracteres'),
})
