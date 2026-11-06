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
    const authStore = useSessionStore()

    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
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

      const authStore = useSessionStore()
      authStore.setAccessToken(newToken)

      processQueue(null, newToken)

      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return axios(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)

      const authStore = useSessionStore()
      authStore.clearSession()

      const { default: router } = await import('@/app/router')
      const current = router.currentRoute.value
      const target =
        current.matched.length > 0
          ? current
          : router.resolve(window.location.pathname + window.location.search)
      if (target.meta.public !== true) {
        router.push({ path: '/login', query: { redirect: target.fullPath } })
      }

      return Promise.reject(refreshError)
    } finally {
      _isRefreshing = false
    }
  })
}
