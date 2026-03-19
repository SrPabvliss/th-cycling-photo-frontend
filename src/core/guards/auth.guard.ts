import type { Router } from 'vue-router'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toCurrentUser } from '@/features/auth/mappers/current-user.mapper'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import type { IApiCurrentUser } from '@/features/auth/types/responses/current-user.response'

let isHydrated = false

export function registerAuthGuard(router: Router): void {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    // Hydrate session once on app load
    // Flow: GET /me → 401 → interceptor refreshes token (cookie) → retries → success
    if (!isHydrated) {
      isHydrated = true
      try {
        const response = await httpClient.get<IApiCurrentUser>(API_ROUTES.AUTH.ME, {
          silent: true,
        })
        const user = toCurrentUser(response.data)
        authStore.setSession(authStore.accessToken!, user)
      } catch {
        // No valid session — user will need to log in
      }
    }

    // Allow public routes (login page)
    if (to.meta.public) {
      // Redirect authenticated users away from login
      if (authStore.isAuthenticated && to.path === '/login') {
        return '/'
      }
      return true
    }

    // Protect private routes
    if (!authStore.isAuthenticated) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    return true
  })
}
