import type { Router } from 'vue-router'

import { API_ROUTES } from '@/core/api/api-routes'
import { getHomePath } from '@/core/auth/role-config'
import { httpClient } from '@/core/http/axios-client'
import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { STANDALONE_PATHS } from '@/core/views/standalone-routes'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { useSessionStore } from '@/core/auth/stores/session.store'
import type { IApiCurrentUser } from '@/core/auth/current-user'

let isHydrated = false

async function hydrateSession(authStore: ReturnType<typeof useSessionStore>): Promise<void> {
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
    const authStore = useSessionStore()

    // Always hydrate on first navigation (public or not)
    await hydrateSession(authStore)

    // Public routes — no auth required
    if (to.meta.public) {
      if (authStore.isAuthenticated && (to.path === ROUTE_PATHS.LOGIN || to.path === ROUTE_PATHS.REGISTER)) {
        return getHomePath(authStore.currentUser?.permissions ?? [])
      }
      return true
    }

    // Auth required — redirect to login if not authenticated
    if (!authStore.isAuthenticated) {
      return { path: ROUTE_PATHS.LOGIN, query: { redirect: to.fullPath } }
    }

    const required = to.meta.permissions as string[] | undefined
    if (required?.length) {
      const held = authStore.currentUser?.permissions ?? []
      if (!required.some((permission) => held.includes(permission))) {
        return STANDALONE_PATHS.ACCESS_DENIED
      }
    }

    return true
  })
}
