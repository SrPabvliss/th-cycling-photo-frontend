import { describe, expect, it } from 'vitest'

import { parsePlate, plateFromQuery } from './plate.utils'

describe('parsePlate', () => {
  it('takes the digits, without the spaces around them', () => {
    expect(parsePlate(' 127 ')).toEqual({ plate: '127', error: null })
    expect(parsePlate('7')).toEqual({ plate: '7', error: null })
    expect(parsePlate('0123456789')).toEqual({ plate: '0123456789', error: null })
  })

  it('reads an empty field as "no plate", which is not an error', () => {
    expect(parsePlate('')).toEqual({ plate: null, error: null })
    expect(parsePlate('   ')).toEqual({ plate: null, error: null })
  })

  it.each(['12a', '1 2 7', '12345678901', '-5', '1.5', '#127', '١٢٧'])(
    'rejects what is not one to ten digits (%s)',
    (raw) => {
      expect(parsePlate(raw)).toEqual({ plate: null, error: 'invalid' })
    },
  )
})

describe('plateFromQuery', () => {
  it('takes a plate from the url', () => {
    expect(plateFromQuery('127')).toBe('127')
    expect(plateFromQuery(['127', '9'])).toBe('127')
  })

  it.each([undefined, null, '', '12a', '12345678901', ['abc']])(
    'gives nothing for a value it cannot use (%j)',
    (value) => {
      expect(plateFromQuery(value)).toBe('')
    },
  )
})
