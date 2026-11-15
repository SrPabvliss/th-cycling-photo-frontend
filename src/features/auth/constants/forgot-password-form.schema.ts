import { z } from 'zod'

import type { IForgotPasswordFormData } from '../types/forgot-password-form.types'

export const FORGOT_PASSWORD_FORM_DEFAULTS: IForgotPasswordFormData = {
  email: '',
}

export const forgotPasswordFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Escribe un correo válido, como tu@correo.com.')
    .email('Escribe un correo válido, como tu@correo.com.')
    .max(255, 'Escribe un correo válido, como tu@correo.com.'),
})
