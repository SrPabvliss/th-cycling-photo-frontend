import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

import { message } from '@/core/ui/discrete-api'
import type { IApiSuccessResponse } from '../http-response.interface'

export function registerSuccessInterceptor(axios: AxiosInstance): void {
  axios.interceptors.response.use((response) => {
    const method = (response.config as InternalAxiosRequestConfig).method?.toUpperCase()
    const isNonGet = method && method !== 'GET'

    if (isNonGet) {
      const body = response.data as IApiSuccessResponse<unknown>
      const successMessage = body?.meta?.message

      if (successMessage) message.success(successMessage)
    }

    return response
  })
}
