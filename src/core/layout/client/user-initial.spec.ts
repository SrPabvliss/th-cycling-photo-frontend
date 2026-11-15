import { describe, expect, it } from 'vitest'

import { userInitial } from './user-initial'

describe('userInitial', () => {
  it('takes the first letter of the name, in upper case', () => {
    expect(userInitial('María Pérez')).toBe('M')
    expect(userInitial('  ana')).toBe('A')
  })

  it('keeps letters of spanish whole', () => {
    expect(userInitial('ñandú')).toBe('Ñ')
  })

  it('keeps a letter written as a base plus a combining accent whole', () => {
    expect(userInitial('élan')).toBe('É')
  })

  it('skips what is not a letter or a digit', () => {
    expect(userInitial('🚴 Pedro')).toBe('P')
    expect(userInitial('¡Hola')).toBe('H')
  })

  it('accepts a digit', () => {
    expect(userInitial('7 Mares')).toBe('7')
  })

  it('gives nothing when the name has no letter or digit', () => {
    expect(userInitial('')).toBeNull()
    expect(userInitial('   ')).toBeNull()
    expect(userInitial(null)).toBeNull()
    expect(userInitial(undefined)).toBeNull()
    expect(userInitial('🚴')).toBeNull()
  })
})
