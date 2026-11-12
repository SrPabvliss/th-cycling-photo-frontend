import { createDiscreteApi } from 'naive-ui'

import { naiveConfig } from '@/core/theme/naive-theme'

export const MESSAGE_CONTAINER_STYLE = { top: '72px' }

const { message, dialog } = createDiscreteApi(['message', 'dialog'], {
  configProviderProps: naiveConfig,
  messageProviderProps: {
    containerStyle: MESSAGE_CONTAINER_STYLE,
  },
})

export { dialog, message }
