import { computed } from 'vue'

import { useSessionStore } from '@/core/auth/stores/session.store'
import { holdsPermission, type PermissionKey } from './permissions'

export function usePermissions() {
  const authStore = useSessionStore()

  const permissions = computed(() => authStore.currentUser?.permissions ?? [])

  function has(key: PermissionKey): boolean {
    return permissions.value.includes(key)
  }

  function hasAny(keys: PermissionKey[]): boolean {
    return keys.some((key) => permissions.value.includes(key))
  }

  function hasForEvent(key: PermissionKey, eventId: string | null | undefined): boolean {
    return holdsPermission(authStore.currentUser, key, eventId ?? null)
  }

  return { permissions, has, hasAny, hasForEvent }
}
