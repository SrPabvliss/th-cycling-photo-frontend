import { defineStore } from 'pinia'
import { computed, readonly, ref, watch, type Ref } from 'vue'

import type { ColorScheme } from './client/client-theme'

export type SchemePreference = 'system' | 'light' | 'dark'

export const COLOR_SCHEME_STORAGE_KEY = 'titan_color_scheme'

// Light until E10 (TIT-113): the client screens not rebuilt yet carry colors written by hand that
// break in dark, so following the system cannot be the default.
const DEFAULT_PREFERENCE: SchemePreference = 'light'

const PREFERENCES: readonly SchemePreference[] = ['system', 'light', 'dark']
const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)'

const resolvedScheme = ref<ColorScheme>('light')

/**
 * Scheme in use, readable without Pinia. The discrete naive api renders when its module loads,
 * before the app installs Pinia, and still has to follow the scheme afterwards.
 */
export const activeScheme: Readonly<Ref<ColorScheme>> = readonly(resolvedScheme)

function isPreference(value: unknown): value is SchemePreference {
  return PREFERENCES.includes(value as SchemePreference)
}

function readSavedPreference(): SchemePreference {
  try {
    const saved = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)
    return isPreference(saved) ? saved : DEFAULT_PREFERENCE
  } catch {
    return DEFAULT_PREFERENCE
  }
}

function savePreference(preference: SchemePreference): void {
  try {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, preference)
  } catch {
    // Storage blocked or full: the choice still holds for this visit.
  }
}

function watchSystemDark(): Ref<boolean> {
  const isDark = ref(false)
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return isDark

  const query = window.matchMedia(SYSTEM_DARK_QUERY)
  isDark.value = query.matches
  query.addEventListener?.('change', (event) => {
    isDark.value = event.matches
  })
  return isDark
}

export const useColorSchemeStore = defineStore('color-scheme', () => {
  const preference = ref<SchemePreference>(readSavedPreference())
  const systemDark = watchSystemDark()

  const scheme = computed<ColorScheme>(() => {
    if (preference.value === 'system') return systemDark.value ? 'dark' : 'light'
    return preference.value
  })

  watch(
    scheme,
    (current) => {
      resolvedScheme.value = current
      document.documentElement.dataset.ttScheme = current
    },
    { immediate: true, flush: 'sync' },
  )

  function setPreference(next: SchemePreference): void {
    preference.value = next
    savePreference(next)
  }

  function toggle(): void {
    setPreference(scheme.value === 'light' ? 'dark' : 'light')
  }

  return { preference, scheme, setPreference, toggle }
})
