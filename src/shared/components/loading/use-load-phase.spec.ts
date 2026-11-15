import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

const online = ref(true)
vi.mock('@/core/network/use-online', () => ({ useOnline: () => online }))

import { useLoadPhase } from './use-load-phase'

type Status = 'pending' | 'error' | 'success'

describe('useLoadPhase', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    online.value = true
  })
  afterEach(() => vi.useRealTimers())

  it('is pending, and shows the skeleton once the load takes long, while there is network', async () => {
    const phase = useLoadPhase(ref<Status>('pending'))

    expect(phase.isPending.value).toBe(true)
    expect(phase.isWaitingForNetwork.value).toBe(false)
    await vi.advanceTimersByTimeAsync(400)
    expect(phase.showSkeleton.value).toBe(true)
  })

  it('without network, a load that did not finish waits for it instead of showing a skeleton', async () => {
    online.value = false
    const pending = useLoadPhase(ref<Status>('pending'))
    const failed = useLoadPhase(ref<Status>('error'))

    expect(pending.isWaitingForNetwork.value).toBe(true)
    expect(pending.isPending.value).toBe(false)
    await vi.advanceTimersByTimeAsync(400)
    expect(pending.showSkeleton.value).toBe(false)
    expect(failed.isWaitingForNetwork.value).toBe(true)
  })

  it('without network, what already loaded is not waiting for anything', () => {
    online.value = false

    expect(useLoadPhase(ref<Status>('success')).isWaitingForNetwork.value).toBe(false)
  })

  it('goes back to loading when the network comes back', () => {
    online.value = false
    const phase = useLoadPhase(ref<Status>('pending'))

    online.value = true

    expect(phase.isWaitingForNetwork.value).toBe(false)
    expect(phase.isPending.value).toBe(true)
  })
})
