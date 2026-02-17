import type { AxiosInstance } from 'axios'

export function registerAuthInterceptor(axios: AxiosInstance): void {
  axios.interceptors.request.use((config) => {
    // TODO: Read JWT from auth Pinia store when auth is implemented
    // const authStore = useAuthStore()
    // if (authStore.token) {
    //   config.headers.Authorization = `Bearer ${authStore.token}`
    // }

    return config
  })
}
