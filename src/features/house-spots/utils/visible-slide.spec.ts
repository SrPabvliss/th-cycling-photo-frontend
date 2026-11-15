import { describe, expect, it } from 'vitest'

import { organizerSlide, slideDelay } from './spot-rotation'
import { clockSlide, slideMessage, visibleSlide } from './visible-slide'

const STARTED = 1_000_000

// A slide element whose CSS animation is at `progress` of its cycle (null: not running).
const slide = (progress: number | null) =>
  ({
    getAnimations: () =>
      progress === null ? [] : [{ effect: { getComputedTiming: () => ({ progress }) } }],
  }) as unknown as Element

describe('clockSlide', () => {
  it('names the slide the animation delays put on screen, at every second of a cycle', () => {
    for (const seed of [0, 3, 31, 59]) {
      for (let second = 0; second < 48; second += 0.5) {
        const now = STARTED + second * 1000
        const onScreen = [0, 1, 2, 3].find((index) => {
          const position = -Number.parseFloat(slideDelay(index, seed, STARTED, now))
          return position < 6
        })
        expect(clockSlide(seed, STARTED, now)).toBe(onScreen)
      }
    }
  })
})

describe('slideMessage', () => {
  it('speaks to organizers on one slide and to brands on the other three', () => {
    const messages = [0, 1, 2, 3].map((index) => slideMessage(index, 31))

    expect(messages[organizerSlide(31)]).toBe('organizador')
    expect(messages.filter((message) => message === 'marca')).toHaveLength(3)
  })
})

describe('visibleSlide', () => {
  it('reads the slide on screen from the running animations', () => {
    expect(visibleSlide([slide(0.5), slide(0.75), slide(0.1), slide(0.3)], 0)).toBe(2)
  })

  it('gives the slide coming in while two cross', () => {
    expect(visibleSlide([slide(0.26), slide(0.01), slide(0.5), slide(0.75)], 0)).toBe(1)
  })

  it('follows a paused animation, not the clock', () => {
    expect(visibleSlide([slide(0.6), slide(0.85), slide(0.35), slide(0.12)], 0)).toBe(3)
  })

  it('falls back to the clock without animations to read', () => {
    expect(visibleSlide([slide(null), slide(null)], 1)).toBe(1)
    expect(visibleSlide([{} as Element], 2)).toBe(2)
    expect(visibleSlide([], 3)).toBe(3)
  })
})
