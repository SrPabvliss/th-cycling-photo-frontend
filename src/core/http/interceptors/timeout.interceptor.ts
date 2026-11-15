import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

import { currentArea } from '@/core/theme/area'

/** How long a client request may take before it counts as too slow. */
export const CLIENT_REQUEST_TIMEOUT_MS = 20_000

const DOWNLOAD_TYPES = new Set(['blob', 'arraybuffer', 'stream'])

// A file going up or coming down takes as long as its size and the connection need.
function movesAFile(config: InternalAxiosRequestConfig): boolean {
  return (
    config.data instanceof FormData ||
    config.data instanceof Blob ||
    config.onUploadProgress !== undefined ||
    DOWNLOAD_TYPES.has(config.responseType ?? '')
  )
}

/**
 * In the client area a request gives up after 20 seconds, so the screen can say it is taking
 * longer than usual instead of waiting for ever. The organizer panel, uploads, downloads and a
 * request with its own limit keep theirs.
 */
export function registerTimeoutInterceptor(instance: AxiosInstance): void {
  instance.interceptors.request.use((config) => {
    if (currentArea.value === 'client' && !config.timeout && !movesAFile(config)) {
      config.timeout = CLIENT_REQUEST_TIMEOUT_MS
    }
    return config
  })
}
