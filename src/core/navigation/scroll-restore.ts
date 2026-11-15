/** Longest a back or forward step waits for the page to be tall enough for its old position. */
export const RESTORE_WAIT_MS = 1500

export interface IScrollPosition {
  left: number
  top: number
}

/**
 * Going back to a client screen whose list measures itself after mounting (the virtual gallery)
 * finds the page short for a moment: scrolling right then would leave it at the top. The old
 * position waits for the page to reach it, and gives up after a while.
 */
export function whenTallEnough<T extends IScrollPosition>(
  position: T,
  wait = RESTORE_WAIT_MS,
): Promise<T> {
  return new Promise((resolve) => {
    const started = performance.now()
    const check = () => {
      const reachable = document.documentElement.scrollHeight - window.innerHeight
      if (reachable >= position.top || performance.now() - started >= wait) resolve(position)
      else requestAnimationFrame(check)
    }
    check()
  })
}
