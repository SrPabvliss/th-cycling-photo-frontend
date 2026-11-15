import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { COLOR_SCHEME_STORAGE_KEY, useColorSchemeStore } from './color-scheme.store'

function stubSystemScheme(dark: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: dark,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

describe('useColorSchemeStore', () => {
  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.ttScheme
    stubSystemScheme(false)
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('starts in light when nothing was saved', () => {
    const store = useColorSchemeStore()

    expect(store.preference).toBe('light')
    expect(store.scheme).toBe('light')
    expect(document.documentElement.dataset.ttScheme).toBe('light')
  })

  it('starts in the saved scheme and marks it on the root element', () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark')

    const store = useColorSchemeStore()

    expect(store.preference).toBe('dark')
    expect(store.scheme).toBe('dark')
    expect(document.documentElement.dataset.ttScheme).toBe('dark')
  })

  it('falls back to light when the saved value is not a known scheme', () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'banana')

    expect(useColorSchemeStore().preference).toBe('light')
  })

  it('works without storage: starts in light and still changes scheme', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })

    const store = useColorSchemeStore()
    expect(store.scheme).toBe('light')

    expect(() => store.setPreference('dark')).not.toThrow()
    expect(store.scheme).toBe('dark')
  })

  it('follows the system when the preference is system', () => {
    stubSystemScheme(true)
    const store = useColorSchemeStore()

    store.setPreference('system')

    expect(store.preference).toBe('system')
    expect(store.scheme).toBe('dark')
  })

  it('toggles from light to dark and saves it', () => {
    const store = useColorSchemeStore()

    store.toggle()

    expect(store.preference).toBe('dark')
    expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe('dark')
  })

  it('follows the choice made in another tab', () => {
    const store = useColorSchemeStore()

    window.dispatchEvent(
      new StorageEvent('storage', { key: COLOR_SCHEME_STORAGE_KEY, newValue: 'dark' }),
    )

    expect(store.preference).toBe('dark')
    expect(store.scheme).toBe('dark')
    expect(document.documentElement.dataset.ttScheme).toBe('dark')
  })

  it('goes back to the default when another tab clears the choice or saves nonsense', () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark')
    const store = useColorSchemeStore()

    window.dispatchEvent(
      new StorageEvent('storage', { key: COLOR_SCHEME_STORAGE_KEY, newValue: null }),
    )
    expect(store.preference).toBe('light')

    store.setPreference('dark')
    window.dispatchEvent(
      new StorageEvent('storage', { key: COLOR_SCHEME_STORAGE_KEY, newValue: 'banana' }),
    )
    expect(store.preference).toBe('light')
  })

  it('ignores what other tabs save under other keys', () => {
    const store = useColorSchemeStore()

    window.dispatchEvent(
      new StorageEvent('storage', { key: 'titan_cart_session_id', newValue: 'dark' }),
    )

    expect(store.preference).toBe('light')
  })

  it('toggles back from dark to light', () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark')
    const store = useColorSchemeStore()

    store.toggle()

    expect(store.preference).toBe('light')
  })
})
