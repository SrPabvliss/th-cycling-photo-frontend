import { createDiscreteApi } from 'naive-ui'

import { titanTvTheme } from '@/core/theme/titan-tv-theme'

const { message, dialog } = createDiscreteApi(['message', 'dialog'], {
  configProviderProps: {
    themeOverrides: titanTvTheme,
  },
})

export { dialog, message }
