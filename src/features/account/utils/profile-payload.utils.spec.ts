import { describe, expect, it } from 'vitest'
import type { IProfileFormData } from '../constants/profile-form.schema'
import { resetLocationBelow } from './location-cascade.utils'
import { buildUpdatePayload, hasUnsavedChanges } from './profile-payload.utils'

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

describe('buildUpdatePayload', () => {
  it('sends provinceId: null when the province is cleared', () => {
    const current = { ...FORM_WITH_LOCATION, provinceId: null }
    expect(buildUpdatePayload(FORM_WITH_LOCATION, current)).toMatchObject({
      provinceId: null,
    })
  })

  it('sends the new countryId together with provinceId and cantonId cleared when the country changes', () => {
    const current = resetLocationBelow('country', { ...FORM_WITH_LOCATION, countryId: 51 })
    expect(buildUpdatePayload(FORM_WITH_LOCATION, current)).toMatchObject({
      countryId: 51,
      provinceId: null,
      cantonId: null,
    })
  })

  it('sends gender: null when the gender is cleared', () => {
    const current = { ...FORM_WITH_LOCATION, gender: null }
    expect(buildUpdatePayload(FORM_WITH_LOCATION, current)).toMatchObject({
      gender: null,
    })
  })

  it('omits a field the user never touched', () => {
    const current = { ...FORM_WITH_LOCATION, firstName: 'Paul' }
    const payload = buildUpdatePayload(FORM_WITH_LOCATION, current)
    expect(payload).not.toHaveProperty('lastName')
    expect(payload).not.toHaveProperty('gender')
    expect(payload).not.toHaveProperty('provinceId')
    expect(payload).not.toHaveProperty('cantonId')
    expect(payload).not.toHaveProperty('birthDate')
  })

  it('sends the new value when a field changes from one value to another', () => {
    const current = { ...FORM_WITH_LOCATION, gender: 'female' as const }
    expect(buildUpdatePayload(FORM_WITH_LOCATION, current)).toMatchObject({
      gender: 'female',
    })
  })
})

describe('hasUnsavedChanges', () => {
  it('is false when current matches the baseline exactly', () => {
    expect(hasUnsavedChanges(FORM_WITH_LOCATION, { ...FORM_WITH_LOCATION })).toBe(false)
  })

  it('is true when a field differs from the baseline', () => {
    const current = { ...FORM_WITH_LOCATION, lastName: 'Andrade' }
    expect(hasUnsavedChanges(FORM_WITH_LOCATION, current)).toBe(true)
  })

  it('is false again once the field is reverted back to the baseline value', () => {
    const edited = { ...FORM_WITH_LOCATION, gender: 'female' as const }
    const reverted = { ...edited, gender: FORM_WITH_LOCATION.gender }
    expect(hasUnsavedChanges(FORM_WITH_LOCATION, reverted)).toBe(false)
  })
})
