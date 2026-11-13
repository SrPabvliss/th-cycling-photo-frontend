import { z } from 'zod'

import { isAccountPassword, PASSWORD_RULE_MESSAGE } from '@/shared/auth/password-rule'

import type { IResetPasswordFormData } from '../types/reset-password-form.types'

export const RESET_PASSWORD_FORM_DEFAULTS: IResetPasswordFormData = {
  password: '',
  confirmPassword: '',
}

const resetPasswordShape = z.object({
  password: z.string().refine(isAccountPassword, PASSWORD_RULE_MESSAGE),
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
