import { describe, expect, it } from 'vitest'

import { resolveItemSummary } from './configuration-item-builder.utils'
import type { ConfigurationItemId } from '../types/configuration-item.types'

const NO_VALUES = {} as Record<ConfigurationItemId, string | null>

describe('resolveItemSummary', () => {
  it('says a new value stays with this event when it is not saved to the profile', () => {
    const summary = resolveItemSummary('publicName', 'new', '', NO_VALUES, false, false)

    expect(summary).toBe('Dato nuevo solo para este evento')
  })

  it('says the value also lands in the profile when the organizer asked for that', () => {
    const summary = resolveItemSummary('publicName', 'new', '', NO_VALUES, false, true)

    expect(summary).toBe('Dato nuevo · se guardará también en tu perfil')
  })

  it('keeps showing the profile value when the item is inherited', () => {
    const summary = resolveItemSummary(
      'publicName',
      'profile',
      'Andes Bike',
      NO_VALUES,
      false,
      true,
    )

    expect(summary).toBe('Andes Bike')
  })

  it('keeps asking for the missing value whatever the save flag says', () => {
    const summary = resolveItemSummary('whatsapp', 'missing', '', NO_VALUES, false, true)

    expect(summary).toBe('Tu perfil no tiene este dato · complétalo aquí')
  })
})
