import type { Router } from 'vue-router'

import { API_ROUTES } from '@/core/api/api-routes'
import { getHomePath } from '@/core/auth/role-config'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { httpClient } from '@/core/http/axios-client'
import { toCurrentUser } from '@/features/auth/mappers/current-user.mapper'
import { STANDALONE_PATHS } from '@/core/views/standalone-routes'
import { AUTH_PATH, REGISTER_PATH } from '@/features/auth/routes'
import type { IApiCurrentUser } from '@/features/auth/types/responses/current-user.response'

let isHydrated = false

async function hydrateSession(sessionStore: ReturnType<typeof useSessionStore>): Promise<void> {
  if (isHydrated) return
  isHydrated = true

  // Only attempt hydration if we have a stored token
  if (!sessionStore.accessToken) return

  try {
    const response = await httpClient.get<IApiCurrentUser>(API_ROUTES.AUTH.ME, {
      silent: true,
    })
    const user = toCurrentUser(response.data)
    sessionStore.setSession(sessionStore.accessToken!, user)
  } catch {
    // Token invalid or expired — clear it
    sessionStore.clearSession()
  }
}

export function registerAuthGuard(router: Router): void {
  router.beforeEach(async (to) => {
    const sessionStore = useSessionStore()

    // Always hydrate on first navigation (public or not)
    await hydrateSession(sessionStore)

    // Public routes — no auth required
    if (to.meta.public) {
      if (sessionStore.isAuthenticated && (to.path === AUTH_PATH || to.path === REGISTER_PATH)) {
        return getHomePath(sessionStore.currentUser?.permissions ?? [])
      }
      return true
    }

    // Auth required — redirect to login if not authenticated
    if (!sessionStore.isAuthenticated) {
      return { path: AUTH_PATH, query: { redirect: to.fullPath } }
    }

    const required = to.meta.permissions as string[] | undefined
    if (required?.length) {
      const held = sessionStore.currentUser?.permissions ?? []
      if (!required.some((permission) => held.includes(permission))) {
        return STANDALONE_PATHS.ACCESS_DENIED
      }
    }

    return true
  })
}
