import { describe, expect, it } from 'vitest'

import { lockedPayoutCopy } from './locked-payout.utils'

describe('lockedPayoutCopy', () => {
  it('offers the profile method and says only an admin can add another one', () => {
    const copy = lockedPayoutCopy('payphone', true, null)

    expect(copy.profileTitle).toBe('Usar la del perfil')
    expect(copy.otherTitle).toBe('No usar en este evento')
    expect(copy.note).toBe('Poner otro número que no esté en el perfil lo hace un administrador.')
  })

  it("offers to keep the event's own method when it has one", () => {
    const copy = lockedPayoutCopy('bankTransfer', true, 'Banco Guayaquil · 9988776655')

    expect(copy.otherTitle).toBe('Mantener la de este evento')
    expect(copy.otherHint).toBe('Banco Guayaquil · 9988776655')
  })

  it('names what the event charges with when the profile has nothing to switch to', () => {
    const copy = lockedPayoutCopy('payphone', false, '911112222')

    expect(copy.note).toBe(
      'Este evento cobra con 911112222. Cambiarlo por otro número lo hace un administrador.',
    )
  })

  it('asks for an admin when neither the profile nor the event has the method', () => {
    const copy = lockedPayoutCopy('bankTransfer', false, null)

    expect(copy.note).toBe(
      'El perfil del negocio no tiene transferencia bancaria. Pídele a un administrador que lo configure.',
    )
  })
})
