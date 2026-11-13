export interface ICartQueue {
  /** Runs `task` after every task queued before it, and settles with its result or its failure. */
  run<T>(task: () => Promise<T>): Promise<T>
  /** True when nothing is running or waiting. */
  isIdle(): boolean
}

/**
 * Runs cart requests one at a time, in the order they were asked for. The server creates the cart
 * on the first add: two adds at once on a cart that does not exist yet can collide, and an add and
 * a remove of the same photo only mean something in order. A task that fails does not stop the
 * ones behind it.
 */
export function createCartQueue(): ICartQueue {
  let tail: Promise<unknown> = Promise.resolve()
  let waiting = 0

  function run<T>(task: () => Promise<T>): Promise<T> {
    waiting++
    // Counted down before the result settles, so whoever awaits it already sees the queue as it is.
    const result = tail.then(async () => {
      try {
        return await task()
      } finally {
        waiting--
      }
    })
    tail = result.catch(() => {})
    return result
  }

  return { run, isIdle: () => waiting === 0 }
}
