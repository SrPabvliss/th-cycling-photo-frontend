import type { RouteComponent, Router } from 'vue-router'

type LazyRouteComponent = () => Promise<unknown>

// Same test as vue-router's own: a component is an object, or a function that carries one of
// these. Any other function is a loader.
function isLazy(component: RouteComponent | LazyRouteComponent): component is LazyRouteComponent {
  return (
    typeof component === 'function' &&
    !('displayName' in component) &&
    !('props' in component) &&
    !('__vccOpts' in component)
  )
}

/**
 * Starts downloading the screen of the address the app opened on, without waiting for the guards.
 * The router asks for it only after them, and the first one waits for the session: the download
 * would start after that answer instead of next to it. The router gets the same module when its
 * turn comes. A failed download is left for the router to meet and report.
 */
export function warmFirstRoute(router: Router, address: string): void {
  for (const record of router.resolve(address).matched) {
    for (const component of Object.values(record.components ?? {})) {
      if (component && isLazy(component)) void component().catch(() => {})
    }
  }
}
