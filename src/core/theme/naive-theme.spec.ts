import { beforeEach, describe, expect, it } from 'vitest'
import { darkTheme } from 'naive-ui'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

import tokens from './client/awana-tokens.json'
import { useColorSchemeStore } from './color-scheme.store'
import { naiveConfig, naiveThemeFor } from './naive-theme'
import { titanTvTheme } from './titan-tv-theme'

describe('naiveThemeFor', () => {
  it('gives the panel its own theme whatever the scheme', () => {
    const { theme, themeOverrides } = naiveThemeFor('panel', 'dark')

    expect(theme).toBeNull()
    expect(themeOverrides).toBe(titanTvTheme)
  })

  it('gives the client the naive dark theme in the dark scheme', () => {
    const { theme, themeOverrides } = naiveThemeFor('client', 'dark')

    expect(theme).toBe(darkTheme)
    expect(themeOverrides.common?.primaryColor).toBe(tokens.colors.dark.primary)
  })

  it('gives the client the light tokens in the light scheme', () => {
    const { theme, themeOverrides } = naiveThemeFor('client', 'light')

    expect(theme).toBeNull()
    expect(themeOverrides.common?.primaryColor).toBe(tokens.colors.light.primary)
  })
})

describe('naiveConfig', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('follows the color scheme store', async () => {
    const store = useColorSchemeStore()
    expect(naiveConfig.value.theme).toBeNull()

    store.setPreference('dark')
    await nextTick()

    expect(naiveConfig.value.theme).toBe(darkTheme)
  })
})
