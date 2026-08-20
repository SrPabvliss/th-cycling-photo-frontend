import { describe, expect, it } from 'vitest'

import { describeOrderState } from './order-state.utils'

describe('describeOrderState', () => {
  it('labels an order still being processed', () => {
    expect(describeOrderState('in_process')).toEqual({ label: 'En proceso', tone: 'warning' })
  })

  it('labels a cancelled order', () => {
    expect(describeOrderState('cancelled')).toEqual({ label: 'Cancelada', tone: 'error' })
  })

  it('gives a ready order no chip at all', () => {
    expect(describeOrderState('ready')).toBeNull()
  })
})
