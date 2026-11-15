import { describe, expect, it } from 'vitest'

import { createCartQueue } from './cart-queue'

function deferred<T = void>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const tick = () => new Promise((resolve) => setTimeout(resolve))

describe('createCartQueue', () => {
  it('runs the tasks one at a time, in the order they came, however long the first takes', async () => {
    const queue = createCartQueue()
    const first = deferred()
    const log: string[] = []

    const done = [
      queue.run(async () => {
        log.push('start 1')
        await first.promise
        log.push('end 1')
      }),
      queue.run(async () => void log.push('run 2')),
      queue.run(async () => void log.push('run 3')),
    ]
    await tick()
    expect(log).toEqual(['start 1'])

    first.resolve()
    await Promise.all(done)

    expect(log).toEqual(['start 1', 'end 1', 'run 2', 'run 3'])
  })

  it('never has two tasks in flight', async () => {
    const queue = createCartQueue()
    let inFlight = 0
    let most = 0
    const task = async () => {
      inFlight++
      most = Math.max(most, inFlight)
      await tick()
      inFlight--
    }

    await Promise.all([queue.run(task), queue.run(task), queue.run(task), queue.run(task)])

    expect(most).toBe(1)
  })

  it('keeps going after a task that fails', async () => {
    const queue = createCartQueue()
    const log: string[] = []

    const failing = queue.run(async () => {
      throw new Error('boom')
    })
    const next = queue.run(async () => void log.push('ran'))

    await expect(failing).rejects.toThrow('boom')
    await next
    expect(log).toEqual(['ran'])
  })

  it('gives each caller the result, or the failure, of its own task', async () => {
    const queue = createCartQueue()

    const results = await Promise.allSettled([
      queue.run(async () => 'a'),
      queue.run(async () => {
        throw new Error('b failed')
      }),
      queue.run(async () => 'c'),
    ])

    expect(results.map((result) => result.status)).toEqual(['fulfilled', 'rejected', 'fulfilled'])
    expect((results[0] as PromiseFulfilledResult<string>).value).toBe('a')
    expect((results[2] as PromiseFulfilledResult<string>).value).toBe('c')
  })

  it('says when it has nothing left to do', async () => {
    const queue = createCartQueue()
    const gate = deferred()
    expect(queue.isIdle()).toBe(true)

    const running = queue.run(() => gate.promise)
    const waiting = queue.run(async () => {})
    expect(queue.isIdle()).toBe(false)

    gate.resolve()
    await Promise.all([running, waiting])
    expect(queue.isIdle()).toBe(true)
  })
})
