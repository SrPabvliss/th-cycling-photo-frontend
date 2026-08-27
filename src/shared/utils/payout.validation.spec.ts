import { describe, expect, it } from 'vitest'

import {
  MAX_ACCOUNT_HOLDER_LENGTH,
  MAX_ACCOUNT_NUMBER_LENGTH,
  MAX_BANK_NAME_LENGTH,
  MAX_PUBLIC_NAME_LENGTH,
  isValidAccountHolder,
  isValidAccountNumber,
  isValidAccountType,
  isValidBankName,
  isValidHolderIdentification,
  isValidPublicName,
} from './payout.validation'

describe('payout field rules', () => {
  it('holds the public name between three characters and the column width', () => {
    expect(isValidPublicName('An')).toBe(false)
    expect(isValidPublicName('  An  ')).toBe(false)
    expect(isValidPublicName('Andes')).toBe(true)
    expect(isValidPublicName('a'.repeat(MAX_PUBLIC_NAME_LENGTH))).toBe(true)
    expect(isValidPublicName('a'.repeat(MAX_PUBLIC_NAME_LENGTH + 1))).toBe(false)
  })

  it('holds the bank name between three characters and the column width', () => {
    expect(isValidBankName('Ba')).toBe(false)
    expect(isValidBankName('Banco Pichincha')).toBe(true)
    expect(isValidBankName('a'.repeat(MAX_BANK_NAME_LENGTH))).toBe(true)
    expect(isValidBankName('a'.repeat(MAX_BANK_NAME_LENGTH + 1))).toBe(false)
  })

  it('wants five digits or more in the account number, and no more than the column', () => {
    expect(isValidAccountNumber('2100')).toBe(false)
    expect(isValidAccountNumber('2100-4588')).toBe(false)
    expect(isValidAccountNumber('21004')).toBe(true)
    expect(isValidAccountNumber('1'.repeat(MAX_ACCOUNT_NUMBER_LENGTH))).toBe(true)
    expect(isValidAccountNumber('1'.repeat(MAX_ACCOUNT_NUMBER_LENGTH + 1))).toBe(false)
  })

  it('holds the account holder between three characters and the column width', () => {
    expect(isValidAccountHolder('An')).toBe(false)
    expect(isValidAccountHolder('Andres Cepeda')).toBe(true)
    expect(isValidAccountHolder('a'.repeat(MAX_ACCOUNT_HOLDER_LENGTH))).toBe(true)
    expect(isValidAccountHolder('a'.repeat(MAX_ACCOUNT_HOLDER_LENGTH + 1))).toBe(false)
  })

  it('takes a ten digit cedula or a thirteen digit ruc and nothing else', () => {
    expect(isValidHolderIdentification('1712345678')).toBe(true)
    expect(isValidHolderIdentification('1712345678001')).toBe(true)
    expect(isValidHolderIdentification('171234567')).toBe(false)
    expect(isValidHolderIdentification('17123456780')).toBe(false)
    expect(isValidHolderIdentification('17123456-8')).toBe(false)
  })

  it('takes only the two account types, whatever the casing', () => {
    expect(isValidAccountType('ahorros')).toBe(true)
    expect(isValidAccountType('Corriente')).toBe(true)
    expect(isValidAccountType('plazo fijo')).toBe(false)
  })
})
