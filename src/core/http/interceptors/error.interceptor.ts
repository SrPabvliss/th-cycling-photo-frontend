import type { AxiosError, AxiosInstance } from 'axios'

import { message } from '@/core/ui/discrete-api'
import type { IApiErrorResponse } from '../http-response.interface'
import { isSessionExpired } from '../session-expired'

// The api already says what went wrong in Spanish. Without its message, the http library's own
// text is English ("Network Error"): the person reads one of these instead.
const NO_CONNECTION = 'Sin conexión. Revisa tu internet e inténtalo de nuevo.'
const SOMETHING_FAILED = 'Algo salió mal. Inténtalo de nuevo.'

function toastText(error: AxiosError<IApiErrorResponse>): string {
  const apiMessage = error.response?.data?.error?.message
  if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage
  return error.response ? SOMETHING_FAILED : NO_CONNECTION
}

export function registerErrorInterceptor(axios: AxiosInstance): void {
  axios.interceptors.response.use(undefined, (error: AxiosError<IApiErrorResponse>) => {
    // An expired session is shown by whoever made the request, not as a generic error.
    if (isSessionExpired(error)) return Promise.reject(error)

    const config = error.config as (typeof error.config & { silent?: boolean }) | undefined

    if (!config?.silent) message.error(toastText(error))

    return Promise.reject(error)
  })
}
