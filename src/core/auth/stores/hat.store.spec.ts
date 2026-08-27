import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useHatStore } from './hat.store'

describe('hat store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('forces the only hat a person can wear', () => {
    const store = useHatStore()
    store.initFor('user-1', true, false)
    expect(store.activeHat).toBe('shopping')

    store.initFor('user-2', false, true)
    expect(store.activeHat).toBe('operating')
  })

  it('defaults a dual-hat person to operating on first login', () => {
    const store = useHatStore()
    store.initFor('user-1', true, true)
    expect(store.activeHat).toBe('operating')
  })

  it('remembers the last hat per user', () => {
    const store = useHatStore()
    store.initFor('user-1', true, true)
    store.setHat('shopping')

    store.reset()
    store.initFor('user-1', true, true)
    expect(store.activeHat).toBe('shopping')
  })

  it('does not leak one user hat into another', () => {
    const store = useHatStore()
    store.initFor('user-1', true, true)
    store.setHat('shopping')

    store.initFor('user-2', true, true)
    expect(store.activeHat).toBe('operating')
  })
})
