import type { AxiosRequestConfig } from 'axios'

import type { IApiSuccessResponse } from './http-response.interface'

export interface IHttpHandler {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<IApiSuccessResponse<T>>
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<IApiSuccessResponse<T>>
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<IApiSuccessResponse<T>>
  patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<IApiSuccessResponse<T>>
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<IApiSuccessResponse<T>>
}
