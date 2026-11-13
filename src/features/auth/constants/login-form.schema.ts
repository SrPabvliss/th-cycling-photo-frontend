import { z } from 'zod'

import type { ILoginFormData } from '../types/login-form.types'

export const LOGIN_FORM_DEFAULTS: ILoginFormData = {
  email: '',
  password: '',
}

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Escribe tu correo.')
    .email('Escribe un correo válido, como tu@correo.com.')
    .max(255, 'Escribe un correo válido, como tu@correo.com.'),
  // No rule here: an account made before the password rule must still be able to sign in.
  password: z.string().min(1, 'Escribe tu contraseña.'),
})
