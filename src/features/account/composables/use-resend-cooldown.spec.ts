import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'

import { useResendCooldown } from './use-resend-cooldown'

describe('useResendCooldown', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('lets the code be sent again only after the wait', () => {
    const scope = effectScope()
    const cooldown = scope.run(() => useResendCooldown())!
    expect(cooldown.canResend.value).toBe(true)

    cooldown.start()
    expect(cooldown.canResend.value).toBe(false)
    expect(cooldown.remaining.value).toBe(60)

    vi.advanceTimersByTime(59_000)
    expect(cooldown.remaining.value).toBe(1)
    expect(cooldown.canResend.value).toBe(false)

    vi.advanceTimersByTime(1_000)
    expect(cooldown.remaining.value).toBe(0)
    expect(cooldown.canResend.value).toBe(true)
    scope.stop()
  })

  it('takes another length and stops with its scope', () => {
    const scope = effectScope()
    const cooldown = scope.run(() => useResendCooldown(5))!

    cooldown.start()
    scope.stop()
    vi.advanceTimersByTime(10_000)

    expect(cooldown.remaining.value).toBe(5)
  })
})
