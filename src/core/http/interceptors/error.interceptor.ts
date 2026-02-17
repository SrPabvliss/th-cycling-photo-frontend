import type { AxiosError, AxiosInstance } from 'axios'

import { message } from '@/core/ui/discrete-api'
import type { IApiErrorResponse } from '../http-response.interface'

export function registerErrorInterceptor(axios: AxiosInstance): void {
  axios.interceptors.response.use(undefined, (error: AxiosError<IApiErrorResponse>) => {
    const apiError = error.response?.data?.error

    const errorMessage = apiError?.message ?? error.message ?? 'An unexpected error occurred'

    message.error(errorMessage)

    return Promise.reject(error)
  })
}
