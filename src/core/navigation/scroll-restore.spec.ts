import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RESTORE_WAIT_MS, whenTallEnough } from './scroll-restore'

let pageHeight = 0
const settled = vi.fn()

describe('whenTallEnough', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'performance'] })
    settled.mockReset()
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      get: () => pageHeight,
    })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
  })
  afterEach(() => vi.useRealTimers())

  it('gives the position back at once when the page already reaches it', async () => {
    pageHeight = 4000

    await expect(whenTallEnough({ left: 0, top: 1500 })).resolves.toEqual({ left: 0, top: 1500 })
  })

  it('waits for a list that measures itself after mounting, then gives the position back', async () => {
    pageHeight = 900
    void whenTallEnough({ left: 0, top: 1500 }).then(settled)

    await vi.advanceTimersByTimeAsync(100)
    expect(settled).not.toHaveBeenCalled()

    pageHeight = 4000
    await vi.advanceTimersByTimeAsync(20)
    expect(settled).toHaveBeenCalledWith({ left: 0, top: 1500 })
  })

  it('stops waiting after a while on a page that never grows that much', async () => {
    pageHeight = 900
    void whenTallEnough({ left: 0, top: 1500 }).then(settled)

    await vi.advanceTimersByTimeAsync(RESTORE_WAIT_MS - 50)
    expect(settled).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(100)
    expect(settled).toHaveBeenCalledWith({ left: 0, top: 1500 })
  })
})
