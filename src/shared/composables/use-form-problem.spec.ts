import { onlineManager } from '@tanstack/vue-query'
import { afterEach, describe, expect, it } from 'vitest'
import { effectScope, nextTick } from 'vue'

import { NETWORK_PROBLEM, OFFLINE_PROBLEM } from '@/shared/utils/form-problem'

import { useFormProblem } from './use-form-problem'

describe('useFormProblem', () => {
  afterEach(() => onlineManager.setOnline(true))

  const setup = () => {
    const scope = effectScope()
    const problem = scope.run(() => useFormProblem())!
    return { problem, scope }
  }

  // The amber "Sin conexión a internet" describes the moment: once the network is back it is no
  // longer true, and the form can be sent again.
  it('clears "Sin conexión" when the network comes back', async () => {
    const { problem, scope } = setup()
    onlineManager.setOnline(false)
    await nextTick()
    problem.value = OFFLINE_PROBLEM

    onlineManager.setOnline(true)
    await nextTick()

    expect(problem.value).toBeNull()
    scope.stop()
  })

  it('keeps any other problem when the network comes back', async () => {
    const { problem, scope } = setup()
    onlineManager.setOnline(false)
    await nextTick()
    problem.value = NETWORK_PROBLEM

    onlineManager.setOnline(true)
    await nextTick()

    expect(problem.value).toBe(NETWORK_PROBLEM)
    scope.stop()
  })
})
