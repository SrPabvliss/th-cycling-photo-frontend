import { describe, expect, it } from 'vitest'

import { passwordFieldValidators } from '@/features/account/constants/profile-form.schema'
import { loginFormSchema } from '../login-form.schema'
import { registerFieldValidators } from '../register-form.schema'
import { resetPasswordFieldValidators } from '../reset-password-form.schema'

const RULE = 'La contraseña no cumple los requisitos.'
const firstError = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.success ? null : result.error!.issues[0]!.message

describe('password rule in the forms', () => {
  it.each([
    ['sign up', registerFieldValidators.password],
    ['reset', resetPasswordFieldValidators.password],
    ['change', passwordFieldValidators.newPassword],
  ])('%s asks for a letter and a number', (_, validator) => {
    expect(firstError(validator.safeParse('abcdefgh'))).toBe(RULE)
    expect(firstError(validator.safeParse('ñ1234567'))).toBeNull()
    expect(firstError(validator.safeParse('a1'.padEnd(129, 'x')))).toBe(RULE)
  })

  it('does not apply the rule to signing in or to the current password', () => {
    expect(loginFormSchema.shape.password.safeParse('abc').success).toBe(true)
    expect(passwordFieldValidators.currentPassword.safeParse('abc').success).toBe(true)
  })
})
