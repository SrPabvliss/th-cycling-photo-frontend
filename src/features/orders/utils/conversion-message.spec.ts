import { describe, expect, it } from 'vitest'
import { buildConversionMessage } from './conversion-message'

describe('buildConversionMessage', () => {
  it('says how much the order will start contributing when converting to a sale', () => {
    expect(buildConversionMessage('sale', 17.5, 'USD')).toBe(
      'Esta orden pasará a contar $17.50 en los ingresos.',
    )
  })

  it('says how much the order will stop contributing when converting to a gift', () => {
    expect(buildConversionMessage('gift', 17.5, 'USD')).toBe(
      'Esta orden dejará de contar $17.50 en los ingresos.',
    )
  })

  it('warns that nothing changes when the order has no registered price', () => {
    expect(buildConversionMessage('sale', null, 'USD')).toBe(
      'Esta orden no tiene precio registrado, así que el total de ingresos no va a cambiar.',
    )
    expect(buildConversionMessage('gift', null, null)).toBe(
      'Esta orden no tiene precio registrado, así que el total de ingresos no va a cambiar.',
    )
  })
})
