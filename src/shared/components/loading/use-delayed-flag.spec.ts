import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, ref } from 'vue'

import { useDelayedFlag } from './use-delayed-flag'

describe('useDelayedFlag', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('never turns on when the source goes back to false before the delay', () => {
    const source = ref(true)
    const flag = useDelayedFlag(source)

    vi.advanceTimersByTime(399)
    source.value = false
    vi.advanceTimersByTime(1000)

    expect(flag.value).toBe(false)
  })

  it('turns on once the source has stayed true for the whole delay', () => {
    const source = ref(true)
    const flag = useDelayedFlag(source)

    vi.advanceTimersByTime(399)
    expect(flag.value).toBe(false)

    vi.advanceTimersByTime(1)
    expect(flag.value).toBe(true)
  })

  it('stays on for the minimum time once shown', () => {
    const source = ref(true)
    const flag = useDelayedFlag(source)
    vi.advanceTimersByTime(400)

    vi.advanceTimersByTime(100)
    source.value = false
    expect(flag.value).toBe(true)

    vi.advanceTimersByTime(299)
    expect(flag.value).toBe(true)

    vi.advanceTimersByTime(1)
    expect(flag.value).toBe(false)
  })

  it('turns off right away when the minimum time has already passed', () => {
    const source = ref(true)
    const flag = useDelayedFlag(source)
    vi.advanceTimersByTime(400 + 400)

    source.value = false

    expect(flag.value).toBe(false)
  })

  it('stays on when the source comes back before the minimum time runs out', () => {
    const source = ref(true)
    const flag = useDelayedFlag(source)
    vi.advanceTimersByTime(400)

    source.value = false
    vi.advanceTimersByTime(100)
    source.value = true
    vi.advanceTimersByTime(1000)

    expect(flag.value).toBe(true)
  })

  it('takes its own delay and minimum', () => {
    const source = ref(true)
    const flag = useDelayedFlag(source, { delay: 50, min: 20 })

    vi.advanceTimersByTime(50)
    expect(flag.value).toBe(true)

    source.value = false
    vi.advanceTimersByTime(20)
    expect(flag.value).toBe(false)
  })

  it('drops its timers when its scope is disposed', () => {
    const source = ref(true)
    const scope = effectScope()
    const flag = scope.run(() => useDelayedFlag(source))!

    scope.stop()
    vi.advanceTimersByTime(1000)

    expect(flag.value).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })
})
