import { readonly, ref, type Ref } from 'vue'
import { START_LOCATION } from 'vue-router'
import type { RouteLocationNormalized, RouteRecordRaw, Router } from 'vue-router'

/**
 * Which interface a route belongs to. The client area gets the awana tokens and the client naive
 * theme; the organizer panel keeps its own. Routes are client unless a record says otherwise.
 */
export type UiArea = 'client' | 'panel'

const area = ref<UiArea>('client')

export const currentArea: Readonly<Ref<UiArea>> = readonly(area)

export function areaOfRoute(route: Pick<RouteLocationNormalized, 'matched'>): UiArea {
  return route.matched.some((record) => record.meta.area === 'panel') ? 'panel' : 'client'
}

/** Marks top level routes that render without the panel layout as panel routes. */
export function inPanelArea(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  return routes.map((route) => ({ ...route, meta: { ...route.meta, area: 'panel' } }))
}

/**
 * Keeps the area on the root element. It has to live there and not on a wrapper: naive teleports
 * modals, drawers and messages to the body, outside of any container the app renders.
 *
 * Register it before any guard that waits: on the very first navigation the area is set up front,
 * so the page already has its colors while the session loads. Later navigations only change it
 * once they finish, or the outgoing screen would switch theme while the next one loads.
 */
export function registerUiArea(router: Router): void {
  function apply(route: Pick<RouteLocationNormalized, 'matched'>): void {
    area.value = areaOfRoute(route)
    document.documentElement.dataset.ttArea = area.value
  }

  router.beforeEach((to, from) => {
    if (from === START_LOCATION) apply(to)
  })
  router.afterEach((to) => apply(to))
}
