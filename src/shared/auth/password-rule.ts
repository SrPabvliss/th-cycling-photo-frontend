// The password an account may be given, the same rule the api applies (TIT-115): 8 to 128
// characters, a letter of any alphabet and a digit. Nothing is trimmed and any other character is
// allowed. Length counts like the api's, in UTF-16 units. Only for a password being set: signing
// in and "current password" accept whatever was stored before the rule existed.
const MIN_LENGTH = 8
const MAX_LENGTH = 128
const HAS_LETTER = /\p{L}/u
const HAS_DIGIT = /\d/

export const PASSWORD_RULE_MESSAGE = 'La contraseña no cumple los requisitos.'

export interface IPasswordChecks {
  length: boolean
  letter: boolean
  digit: boolean
}

export function passwordChecks(value: string): IPasswordChecks {
  return {
    length: value.length >= MIN_LENGTH && value.length <= MAX_LENGTH,
    letter: HAS_LETTER.test(value),
    digit: HAS_DIGIT.test(value),
  }
}

export function isAccountPassword(value: string): boolean {
  const checks = passwordChecks(value)
  return checks.length && checks.letter && checks.digit
}
