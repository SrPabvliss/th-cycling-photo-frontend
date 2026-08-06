import { z } from 'zod'

import type { IForgotPasswordFormData } from '../types/forgot-password-form.types'

export const FORGOT_PASSWORD_FORM_DEFAULTS: IForgotPasswordFormData = {
  email: '',
}

export const forgotPasswordFormSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Ingresa un correo válido')
    .max(255, 'Máximo 255 caracteres'),
})
