import type { Router } from 'vue-router'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { toCurrentUser } from '@/features/auth/mappers/current-user.mapper'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import type { IApiCurrentUser } from '@/features/auth/types/responses/current-user.response'
import { EVENTS_PATH } from '@/features/events/routes'

let isHydrated = false

async function hydrateSession(authStore: ReturnType<typeof useAuthStore>): Promise<void> {
  if (isHydrated) return
  isHydrated = true

  // Only attempt hydration if we have a stored token
  if (!authStore.accessToken) return

  try {
    const response = await httpClient.get<IApiCurrentUser>(API_ROUTES.AUTH.ME, {
      silent: true,
    })
    const user = toCurrentUser(response.data)
    authStore.setSession(authStore.accessToken!, user)
  } catch {
    // Token invalid or expired — clear it
    authStore.clearSession()
  }
}

export function registerAuthGuard(router: Router): void {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    // Always hydrate on first navigation (public or not)
    await hydrateSession(authStore)

    // Public routes — no auth required
    if (to.meta.public) {
      if (authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
        const isCustomer = authStore.currentUser?.role === 'customer'
        return isCustomer ? '/' : EVENTS_PATH
      }
      return true
    }

    // Auth required — redirect to login if not authenticated
    if (!authStore.isAuthenticated) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    // Role check
    const allowedRoles = to.meta.roles as string[] | undefined
    if (allowedRoles && !allowedRoles.includes(authStore.currentUser!.role)) {
      return '/access-denied'
    }

    return true
  })
}
