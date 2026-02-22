import type { IApiSuccessResponse } from './http-response.interface'

export interface IHttpRequestConfig {
  params?: Record<string, unknown>
  headers?: Record<string, string>
  signal?: AbortSignal
}

export interface IHttpHandler {
  get<T>(url: string, config?: IHttpRequestConfig): Promise<IApiSuccessResponse<T>>
  post<T>(url: string, data?: unknown, config?: IHttpRequestConfig): Promise<IApiSuccessResponse<T>>
  put<T>(url: string, data?: unknown, config?: IHttpRequestConfig): Promise<IApiSuccessResponse<T>>
  patch<T>(
    url: string,
    data?: unknown,
    config?: IHttpRequestConfig,
  ): Promise<IApiSuccessResponse<T>>
  delete<T>(url: string, config?: IHttpRequestConfig): Promise<IApiSuccessResponse<T>>
}
