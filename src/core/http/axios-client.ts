import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'

import { env } from '@/core/config/env'

import type { IHttpHandler } from './http-handler.interface'
import type { IApiSuccessResponse } from './http-response.interface'
import { registerAuthInterceptor } from './interceptors/auth.interceptor'
import { registerErrorInterceptor } from './interceptors/error.interceptor'
import { registerSuccessInterceptor } from './interceptors/success.interceptor'

class AxiosClient implements IHttpHandler {
  private static instance: AxiosClient
  private readonly axios: AxiosInstance

  private constructor() {
    this.axios = axios.create({
      baseURL: env.VITE_API_BASE_URL,
    })

    registerAuthInterceptor(this.axios)
    registerSuccessInterceptor(this.axios)
    registerErrorInterceptor(this.axios)
  }

  static getInstance(): AxiosClient {
    if (!AxiosClient.instance) {
      AxiosClient.instance = new AxiosClient()
    }
    return AxiosClient.instance
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<IApiSuccessResponse<T>> {
    const response = await this.axios.get<IApiSuccessResponse<T>>(url, config)
    return response.data
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<IApiSuccessResponse<T>> {
    const response = await this.axios.post<IApiSuccessResponse<T>>(url, data, config)
    return response.data
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<IApiSuccessResponse<T>> {
    const response = await this.axios.put<IApiSuccessResponse<T>>(url, data, config)
    return response.data
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<IApiSuccessResponse<T>> {
    const response = await this.axios.patch<IApiSuccessResponse<T>>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<IApiSuccessResponse<T>> {
    const response = await this.axios.delete<IApiSuccessResponse<T>>(url, config)
    return response.data
  }
}

export const httpClient: IHttpHandler = AxiosClient.getInstance()
