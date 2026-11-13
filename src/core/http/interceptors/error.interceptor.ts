import type { AxiosError, AxiosInstance } from 'axios'

import { message } from '@/core/ui/discrete-api'
import type { IApiErrorResponse } from '../http-response.interface'
import { isSessionExpired } from '../session-expired'

export function registerErrorInterceptor(axios: AxiosInstance): void {
  axios.interceptors.response.use(undefined, (error: AxiosError<IApiErrorResponse>) => {
    // An expired session is shown by whoever made the request, not as a generic error.
    if (isSessionExpired(error)) return Promise.reject(error)

    const config = error.config as (typeof error.config & { silent?: boolean }) | undefined

    if (!config?.silent) {
      const apiError = error.response?.data?.error
      const errorMessage = apiError?.message ?? error.message ?? 'An unexpected error occurred'
      message.error(errorMessage)
    }

    return Promise.reject(error)
  })
}
