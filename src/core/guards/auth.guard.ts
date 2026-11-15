import type { Router } from 'vue-router'

import { API_ROUTES } from '@/core/api/api-routes'
import { getHomePath } from '@/core/auth/role-config'
import { httpClient } from '@/core/http/axios-client'
import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { STANDALONE_PATHS } from '@/core/views/standalone-routes'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { safeRedirect } from '@/core/navigation/safe-redirect'
import { useSessionStore } from '@/core/auth/stores/session.store'
import type { IApiCurrentUser } from '@/core/auth/current-user'
import { holdsPermission } from '@/core/auth/permissions'

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

function isSignInPage(path: string): boolean {
  return path === ROUTE_PATHS.LOGIN || path === ROUTE_PATHS.REGISTER
}

export function registerAuthGuard(router: Router): void {
  router.beforeEach(async (to) => {
    const authStore = useSessionStore()

    // Always hydrate on first navigation (public or not)
    await hydrateSession(authStore)

    // Public routes — no auth required
    if (to.meta.public) {
      if (authStore.isAuthenticated && isSignInPage(to.path)) {
        // Already signed in: on to where the link meant to go, if it is on this site.
        const target = safeRedirect(to.query.redirect)
        if (target && !isSignInPage(target.split(/[?#]/)[0]!)) return target
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
      const user = authStore.currentUser
      const isAllowed = to.meta.eventScoped
        ? required.some((permission) => holdsPermission(user, permission))
        : required.some((permission) => user?.permissions.includes(permission))
      if (!isAllowed) return STANDALONE_PATHS.ACCESS_DENIED
    }

    return true
  })
}
