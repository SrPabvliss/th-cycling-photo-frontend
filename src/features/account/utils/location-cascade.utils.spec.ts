import { describe, expect, it } from 'vitest'
import type { IProfileFormData } from '../constants/profile-form.schema'
import { resetLocationBelow } from './location-cascade.utils'

const FORM_WITH_LOCATION: IProfileFormData = {
  firstName: 'Pablo',
  lastName: 'Villacres',
  countryId: 63,
  provinceId: 4,
  cantonId: 12,
  birthDay: 13,
  birthMonth: 5,
  birthYear: 1998,
  gender: 'male',
}

describe('resetLocationBelow', () => {
  it('clears province and canton when the country changes', () => {
    expect(resetLocationBelow('country', FORM_WITH_LOCATION)).toMatchObject({
      provinceId: null,
      cantonId: null,
    })
  })

  it('clears only the canton when the province changes', () => {
    expect(resetLocationBelow('province', FORM_WITH_LOCATION)).toMatchObject({
      cantonId: null,
    })
  })

  it('does not mutate the source data', () => {
    resetLocationBelow('country', FORM_WITH_LOCATION)
    expect(FORM_WITH_LOCATION.provinceId).toBe(4)
    expect(FORM_WITH_LOCATION.cantonId).toBe(12)
  })

  it('keeps the province when only the canton level is reset', () => {
    expect(resetLocationBelow('province', FORM_WITH_LOCATION)).toMatchObject({
      provinceId: 4,
    })
  })
})
