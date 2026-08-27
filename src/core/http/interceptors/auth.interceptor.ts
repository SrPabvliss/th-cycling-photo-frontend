import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

import { API_ROUTES } from '@/core/api/api-routes'
import { useSessionStore } from '@/core/auth/stores/session.store'

let _isRefreshing = false
let _failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  for (const pending of _failedQueue) {
    if (token) {
      pending.resolve(token)
    } else {
      pending.reject(error)
    }
  }
  _failedQueue = []
}

export function registerAuthInterceptor(axios: AxiosInstance): void {
  // --- Request interceptor: attach Bearer token ---
  axios.interceptors.request.use((config) => {
    const sessionStore = useSessionStore()

    if (sessionStore.accessToken) {
      config.headers.Authorization = `Bearer ${sessionStore.accessToken}`
    }

    return config
  })

  // --- Response interceptor: silent refresh on 401 ---
  axios.interceptors.response.use(undefined, async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _skipAuthRetry?: boolean })
      | undefined

    if (!originalRequest || error.response?.status !== 401 || originalRequest._skipAuthRetry) {
      return Promise.reject(error)
    }

    originalRequest._skipAuthRetry = true

    if (_isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        _failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return axios(originalRequest)
      })
    }

    _isRefreshing = true

    try {
      const response = await axios.post(API_ROUTES.AUTH.REFRESH, undefined, {
        _skipAuthRetry: true,
        silent: true,
      } as InternalAxiosRequestConfig & { _skipAuthRetry?: boolean; silent?: boolean })

      const newToken: string = response.data.data.accessToken

      const sessionStore = useSessionStore()
      sessionStore.setAccessToken(newToken)

      processQueue(null, newToken)

      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return axios(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)

      const sessionStore = useSessionStore()
      sessionStore.clearSession()

      // Only redirect to login if current route requires auth
      const { default: router } = await import('@/app/router')
      if (router.currentRoute.value.meta.public !== true) {
        router.push('/login')
      }

      return Promise.reject(refreshError)
    } finally {
      _isRefreshing = false
    }
  })
}
