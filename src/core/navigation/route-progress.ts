import { readonly, ref, type Ref } from 'vue'
import type { Router } from 'vue-router'

const active = ref(false)

/** True from the moment a navigation to another screen starts until it ends, however it ends. */
export const routeProgressActive: Readonly<Ref<boolean>> = readonly(active)

export function registerRouteProgress(router: Router): void {
  router.beforeEach((to, from) => {
    // Filters, pages and anchors change the query or the hash of the same screen.
    if (to.path !== from.path) active.value = true
  })

  // Runs for finished, cancelled, redirected and duplicated navigations alike.
  router.afterEach(() => {
    active.value = false
  })

  // A guard that throws or a screen whose chunk fails to load never reaches afterEach.
  router.onError(() => {
    active.value = false
  })
}
