import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useSessionStore } from '@/core/auth/stores/session.store'

/**
 * The session closed while a screen that needs it was up. The client layout then shows "Tu sesión
 * se cerró" in place of that screen; nothing on it repeats the notice.
 */
export function useSessionClosedScreen() {
  const session = useSessionStore()
  const route = useRoute()
  return computed(() => session.expired && route.meta.public !== true)
}
