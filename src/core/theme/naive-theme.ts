import { computed, type ComputedRef } from 'vue'
import { darkTheme, type GlobalTheme, type GlobalThemeOverrides } from 'naive-ui'

import { currentArea, type UiArea } from './area'
import { buildClientTheme, type ColorScheme } from './client/client-theme'
import { activeScheme } from './color-scheme.store'
import { titanTvTheme } from './titan-tv-theme'

export interface INaiveThemeConfig {
  theme: GlobalTheme | null
  themeOverrides: GlobalThemeOverrides
}

const CLIENT_THEMES: Record<ColorScheme, INaiveThemeConfig> = {
  light: { theme: null, themeOverrides: buildClientTheme('light') },
  dark: { theme: darkTheme, themeOverrides: buildClientTheme('dark') },
}

const PANEL_THEME: INaiveThemeConfig = { theme: null, themeOverrides: titanTvTheme }

/** The organizer panel has no dark scheme: it keeps its theme whatever the client chose. */
export function naiveThemeFor(area: UiArea, scheme: ColorScheme): INaiveThemeConfig {
  return area === 'panel' ? PANEL_THEME : CLIENT_THEMES[scheme]
}

/** Theme for every naive provider of the app: the one in App.vue and the discrete api. */
export const naiveConfig: ComputedRef<INaiveThemeConfig> = computed(() =>
  naiveThemeFor(currentArea.value, activeScheme.value),
)
