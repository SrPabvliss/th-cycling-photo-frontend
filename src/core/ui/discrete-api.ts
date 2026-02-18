import { createDiscreteApi } from 'naive-ui'

import { titanTvTheme } from '@/core/theme/titan-tv-theme'

const { message } = createDiscreteApi(['message'], {
  configProviderProps: {
    themeOverrides: titanTvTheme,
  },
})

export { message }
