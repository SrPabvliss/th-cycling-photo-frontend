import { API_ROUTES } from '@/core/api/api-routes'
import { toCurrentUser } from '@/core/auth/current-user.mapper'
import type { IApiCurrentUser } from '@/core/auth/current-user'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { httpClient } from '@/core/http/axios-client'

/**
 * Reads `me` again so the session shows what just changed (a consent, a prompt that is gone).
 * Without a session there is nothing to read; a failed read keeps the session as it was.
 */
export async function refreshSessionUser(): Promise<void> {
  const authStore = useSessionStore()
  if (!authStore.accessToken) return
  try {
    const meResponse = await httpClient.get<IApiCurrentUser>(API_ROUTES.AUTH.ME, { silent: true })
    authStore.setSession(authStore.accessToken, toCurrentUser(meResponse.data))
  } catch {
    return
  }
}
