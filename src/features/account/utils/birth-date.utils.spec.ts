import { describe, expect, it } from 'vitest'
import { decomposeBirthDate } from './birth-date.utils'

describe('decomposeBirthDate', () => {
  it('decomposes a plain date-only string', () => {
    expect(decomposeBirthDate('1998-05-13')).toEqual({
      birthYear: 1998,
      birthMonth: 5,
      birthDay: 13,
    })
  })

  it('decomposes a full ISO datetime string without producing NaN', () => {
    expect(decomposeBirthDate('1998-05-13T00:00:00.000Z')).toEqual({
      birthYear: 1998,
      birthMonth: 5,
      birthDay: 13,
    })
  })

  it('returns all nulls for a null birth date', () => {
    expect(decomposeBirthDate(null)).toEqual({
      birthYear: null,
      birthMonth: null,
      birthDay: null,
    })
  })
})
