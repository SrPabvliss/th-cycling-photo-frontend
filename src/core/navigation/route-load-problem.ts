import { ref } from 'vue'
import type { Router } from 'vue-router'

import { isOffline } from '@/core/network/use-online'

/**
 * A route whose code could not be fetched, with network: the page stays where it was and says it
 * could not open the next one, with a retry that loads it again. Without network nothing is said
 * here: the navigation is cancelled and the offline strip already says why.
 */
export const routeLoadProblem = ref<{ target: string } | null>(null)

const CHUNK_LOAD_MESSAGES = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'error loading dynamically imported module',
  'Unable to preload CSS',
]

export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return CHUNK_LOAD_MESSAGES.some((text) => error.message.includes(text))
}

/** Loads the page that could not open, from scratch, so it asks for its code again. */
export function retryRouteLoad(): void {
  const target = routeLoadProblem.value?.target
  if (target) window.location.assign(target)
}

export function registerRouteLoadProblems(router: Router): void {
  router.onError((error, to) => {
    if (!isChunkLoadError(error)) return
    routeLoadProblem.value = isOffline() ? null : { target: to.fullPath }
  })

  router.afterEach((_to, _from, failure) => {
    if (!failure) routeLoadProblem.value = null
  })

  // The router already answered the failure; whoever started the navigation (a button calling
  // `router.push`) need not, and the browser must not report it as unhandled.
  window.addEventListener('unhandledrejection', (event) => {
    if (isChunkLoadError(event.reason)) event.preventDefault()
  })
}
