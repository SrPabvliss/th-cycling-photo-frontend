import { computed } from 'vue'

import { useAuthStore } from '@/features/auth/stores/auth.store'
import type { PermissionKey } from './permissions'

export function usePermissions() {
  const authStore = useAuthStore()

  const permissions = computed(() => authStore.currentUser?.permissions ?? [])

  function has(key: PermissionKey): boolean {
    return permissions.value.includes(key)
  }

  function hasAny(keys: PermissionKey[]): boolean {
    return keys.some((key) => permissions.value.includes(key))
  }

  return { permissions, has, hasAny }
}
