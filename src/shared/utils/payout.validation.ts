import { ACCOUNT_TYPES } from '@/shared/constants/payout'

export const MIN_PUBLIC_NAME_LENGTH = 3
export const MIN_BANK_NAME_LENGTH = 3
export const MIN_ACCOUNT_HOLDER_LENGTH = 3
export const MIN_ACCOUNT_NUMBER_LENGTH = 5

export const MAX_PUBLIC_NAME_LENGTH = 200
export const MAX_BANK_NAME_LENGTH = 100
export const MAX_ACCOUNT_NUMBER_LENGTH = 50
export const MAX_ACCOUNT_HOLDER_LENGTH = 200
export const MAX_HOLDER_IDENTIFICATION_LENGTH = 20

export const ACCOUNT_NUMBER_PATTERN = /^\d{5,}$/
export const HOLDER_IDENTIFICATION_PATTERN = /^(\d{10}|\d{13})$/

function withinLength(value: string, min: number, max: number): boolean {
  const trimmed = value.trim()
  return trimmed.length >= min && trimmed.length <= max
}

export function isValidPublicName(value: string): boolean {
  return withinLength(value, MIN_PUBLIC_NAME_LENGTH, MAX_PUBLIC_NAME_LENGTH)
}

export function isValidBankName(value: string): boolean {
  return withinLength(value, MIN_BANK_NAME_LENGTH, MAX_BANK_NAME_LENGTH)
}

export function isValidAccountNumber(value: string): boolean {
  const trimmed = value.trim()
  return ACCOUNT_NUMBER_PATTERN.test(trimmed) && trimmed.length <= MAX_ACCOUNT_NUMBER_LENGTH
}

export function isValidAccountType(value: string): boolean {
  return ACCOUNT_TYPES.some((type) => type === value.trim().toLowerCase())
}

export function isValidAccountHolder(value: string): boolean {
  return withinLength(value, MIN_ACCOUNT_HOLDER_LENGTH, MAX_ACCOUNT_HOLDER_LENGTH)
}

export function isValidHolderIdentification(value: string): boolean {
  const trimmed = value.trim()
  return (
    HOLDER_IDENTIFICATION_PATTERN.test(trimmed) &&
    trimmed.length <= MAX_HOLDER_IDENTIFICATION_LENGTH
  )
}
