import { describe, expect, it } from 'vitest'

import { forgotPasswordFormSchema } from '../forgot-password-form.schema'
import { loginFormSchema } from '../login-form.schema'
import { registerFieldValidators } from '../register-form.schema'

const emailValidators = {
  login: loginFormSchema.shape.email,
  register: registerFieldValidators.email,
  forgotPassword: forgotPasswordFormSchema.shape.email,
}

describe.each(Object.entries(emailValidators))('%s email validator', (_name, validator) => {
  it('accepts an email with spaces around it', () => {
    expect(validator.safeParse('  ana@example.com  ').success).toBe(true)
  })

  it('still rejects an email made only of spaces', () => {
    expect(validator.safeParse('   ').success).toBe(false)
  })

  it('still rejects a malformed email', () => {
    expect(validator.safeParse(' ana@ ').success).toBe(false)
  })
})
