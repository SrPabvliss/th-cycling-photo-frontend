import { describe, expect, it } from 'vitest'

import { fillBanner, organizerSlide, slideDelay } from './ad-rotation'

describe('ad rotation', () => {
  it('puts the organizer message on one slide chosen by the seed', () => {
    expect(organizerSlide(7)).toBe(3)
    expect(organizerSlide(8)).toBe(0)
  })

  it('gives each slide a negative delay within one 24 s cycle', () => {
    for (let index = 0; index < 4; index += 1) {
      const delay = slideDelay(index, 3, 1_000, 61_000)
      expect(delay).toMatch(/^-\d+\.\d{2}s$/)
      const seconds = Number.parseFloat(delay)
      expect(seconds).toBeLessThanOrEqual(0)
      expect(seconds).toBeGreaterThan(-24)
    }
  })

  it('starts each carousel at another point depending on its seed', () => {
    expect(slideDelay(0, 3, 0, 0)).not.toBe(slideDelay(0, 4, 0, 0))
  })

  it('keeps going from a fixed origin instead of restarting', () => {
    expect(slideDelay(0, 3, 0, 6_000)).not.toBe(slideDelay(0, 3, 6_000, 6_000))
  })

  it('fills the markers it knows and leaves nothing else', () => {
    expect(fillBanner('<b>{{title}}</b>{{gone}}', { title: 'Tu marca aquí' })).toBe(
      '<b>Tu marca aquí</b>',
    )
  })
})
