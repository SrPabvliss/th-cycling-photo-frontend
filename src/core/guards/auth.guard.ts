import type { Router } from 'vue-router'

import { API_ROUTES } from '@/core/api/api-routes'
import { getHomePath } from '@/core/auth/role-config'
import { httpClient } from '@/core/http/axios-client'
import { toCurrentUser } from '@/features/auth/mappers/current-user.mapper'
import { STANDALONE_PATHS } from '@/core/views/standalone-routes'
import { AUTH_PATH, REGISTER_PATH } from '@/features/auth/routes'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import type { IApiCurrentUser } from '@/features/auth/types/responses/current-user.response'

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
      if (authStore.isAuthenticated && (to.path === AUTH_PATH || to.path === REGISTER_PATH)) {
        return getHomePath(authStore.currentUser?.permissions ?? [])
      }
      return true
    }

    // Auth required — redirect to login if not authenticated
    if (!authStore.isAuthenticated) {
      return { path: AUTH_PATH, query: { redirect: to.fullPath } }
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
