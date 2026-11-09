import { createDiscreteApi } from 'naive-ui'

import { titanTvTheme } from '@/core/theme/titan-tv-theme'

export const MESSAGE_CONTAINER_STYLE = { top: '72px' }

const { message, dialog } = createDiscreteApi(['message', 'dialog'], {
  configProviderProps: {
    themeOverrides: titanTvTheme,
  },
  messageProviderProps: {
    containerStyle: MESSAGE_CONTAINER_STYLE,
  },
})

export { dialog, message }
