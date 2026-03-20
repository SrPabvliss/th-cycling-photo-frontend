import type { Router } from 'vue-router'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toCurrentUser } from '@/features/auth/mappers/current-user.mapper'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import type { IApiCurrentUser } from '@/features/auth/types/responses/current-user.response'
import { EVENTS_PATH } from '@/features/events/routes'

let isHydrated = false

export function registerAuthGuard(router: Router): void {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    // Hydrate session once on app load
    if (!isHydrated) {
      isHydrated = true
      try {
        const response = await httpClient.get<IApiCurrentUser>(API_ROUTES.AUTH.ME, {
          silent: true,
        })
        const user = toCurrentUser(response.data)
        authStore.setSession(authStore.accessToken!, user)
      } catch {
        // No valid session
      }
    }

    // Public routes — no auth required
    if (to.meta.public) {
      if (authStore.isAuthenticated && to.path === '/login') {
        return EVENTS_PATH
      }
      return true
    }

    // Auth required — redirect to login if not authenticated
    if (!authStore.isAuthenticated) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    // Role check — redirect to access-denied if role not allowed
    const allowedRoles = to.meta.roles as string[] | undefined
    if (allowedRoles && !allowedRoles.includes(authStore.currentUser!.role)) {
      return '/access-denied'
    }

    return true
  })
}
