import { describe, expect, it } from 'vitest'

import { useBuyerFilters } from './use-buyer-filters'

describe('useBuyerFilters', () => {
  it('adds a chip when a filter is set', () => {
    const { gender, activeChips } = useBuyerFilters()

    expect(activeChips.value).toHaveLength(0)

    gender.value = 'female'

    expect(activeChips.value.map((chip) => chip.id)).toEqual(['gender'])
  })

  it('removing a chip clears that filter and no other', () => {
    const { gender, countryId, activeChips } = useBuyerFilters()
    gender.value = 'female'
    countryId.value = 7

    const genderChip = activeChips.value.find((chip) => chip.id === 'gender')
    genderChip?.clear()

    expect(gender.value).toBeNull()
    expect(countryId.value).toBe(7)
    expect(activeChips.value.map((chip) => chip.id)).toEqual(['countryId'])
  })

  it('clearAll empties everything including the tab, which returns to "all"', () => {
    const { purchase, gender, search, countryId, activeChips, clearAll } = useBuyerFilters()
    purchase.value = 'never'
    gender.value = 'male'
    search.value = 'ana'
    countryId.value = 3

    clearAll()

    expect(purchase.value).toBe('all')
    expect(gender.value).toBeNull()
    expect(search.value).toBeNull()
    expect(countryId.value).toBeNull()
    expect(activeChips.value).toHaveLength(0)
  })
})
