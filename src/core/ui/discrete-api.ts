import { createDiscreteApi } from 'naive-ui'

import { naiveConfig } from '@/core/theme/naive-theme'

// Toasts on their layer, under the route bar; the panel keeps Naive's 6000 behind it.
export const MESSAGE_CONTAINER_STYLE = { top: '72px', zIndex: 'var(--tt-layer-toast, 6000)' }

const { message, dialog } = createDiscreteApi(['message', 'dialog'], {
  configProviderProps: naiveConfig,
  messageProviderProps: {
    containerStyle: MESSAGE_CONTAINER_STYLE,
  },
})

export { dialog, message }
