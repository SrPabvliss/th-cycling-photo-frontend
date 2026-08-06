import { z } from 'zod'

import type { IResetPasswordFormData } from '../types/reset-password-form.types'

export const RESET_PASSWORD_FORM_DEFAULTS: IResetPasswordFormData = {
  password: '',
  confirmPassword: '',
}

const resetPasswordShape = z.object({
  password: z.string().min(8, 'Mínimo 8 caracteres').max(128, 'Máximo 128 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma la contraseña'),
})

export const resetPasswordFormSchema = resetPasswordShape.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  },
)

export const resetPasswordFieldValidators = resetPasswordShape.shape
