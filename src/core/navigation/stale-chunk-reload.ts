import type { Router } from 'vue-router'

/** Session key holding when we last reloaded because a chunk was missing. */
export const STALE_CHUNK_RELOAD_KEY = 'titan:stale-chunk-reload-at'

/**
 * A second missing chunk inside this window means the reload did not help
 * (the chunk is really gone, or the network is down), so we stop reloading.
 */
export const STALE_CHUNK_RELOAD_WINDOW_MS = 10_000

function readLastReload(): number | null {
  try {
    const raw = window.sessionStorage.getItem(STALE_CHUNK_RELOAD_KEY)
    const value = raw === null ? Number.NaN : Number(raw)
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

function writeLastReload(at: number): boolean {
  try {
    window.sessionStorage.setItem(STALE_CHUNK_RELOAD_KEY, String(at))
    return true
  } catch {
    return false
  }
}

/**
 * Reloads the page once, landing on `target` when a navigation was underway.
 * Returns false when it refused to reload, either because it already did so a
 * moment ago or because it cannot remember having done so (no storage), since
 * reloading without that memory could loop forever.
 */
export function reloadOnceForStaleChunk(target: string | null): boolean {
  const now = Date.now()
  const last = readLastReload()
  if (last !== null && now - last >= 0 && now - last < STALE_CHUNK_RELOAD_WINDOW_MS) return false
  if (!writeLastReload(now)) return false

  if (target) window.location.assign(target)
  else window.location.reload()
  return true
}

/**
 * After a deploy, a tab still running the previous build asks for chunks whose
 * hashed names no longer exist. Vite reports that as `vite:preloadError`; we
 * reload once so the tab picks up the new build, on the page it was going to.
 */
export function registerStaleChunkReload(router: Router): void {
  let pendingTarget: string | null = null

  router.beforeEach((to) => {
    pendingTarget = to.fullPath
  })
  router.afterEach(() => {
    pendingTarget = null
  })

  window.addEventListener('vite:preloadError', () => {
    reloadOnceForStaleChunk(pendingTarget)
  })
}
