import { describe, expect, it } from 'vitest'

import { MESSAGE_CONTAINER_STYLE } from './discrete-api'

describe('the toast container', () => {
  // The client area moves it under the offline strip while the strip is open (OfflineStrip).
  it('takes its top from the page when it says one, 72 px otherwise', () => {
    expect(MESSAGE_CONTAINER_STYLE.top).toBe('var(--tt-toast-top, 72px)')
  })
})
